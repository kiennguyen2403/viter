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

func main() {
	if err := conf.LoadConfig(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	engine.RegisterEndpoint(http.MethodOptions, "/execute", func(c web.Context) error {
		print(("OPTIONS"))
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
