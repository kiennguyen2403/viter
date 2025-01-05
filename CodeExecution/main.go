package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/runabol/code-execution-demo/handler"
	"github.com/runabol/tork/cli"
	"github.com/runabol/tork/conf"
	"github.com/runabol/tork/engine"
	"github.com/runabol/tork/middleware/web"
)

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func main() {
	// Set Docker API version
	os.Setenv("DOCKER_API_VERSION", "1.43")

	if err := conf.LoadConfig(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	// Register the endpoints with CORS middleware
	engine.RegisterEndpoint(http.MethodOptions, "/execute", func(c web.Context) error {
		c.Response().Header().Set("Access-Control-Allow-Origin", "*")
		c.Response().Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		return c.NoContent(http.StatusOK)
	})
	engine.RegisterEndpoint(http.MethodPost, "/execute", handler.Handler)

	if err := cli.New().Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
