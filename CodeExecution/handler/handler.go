package handler

import (
	"net/http"
	"strings"
	"time"
	"github.com/pkg/errors"
	"github.com/rs/zerolog/log"
	"github.com/runabol/tork"
	"github.com/runabol/tork/engine"
	"github.com/runabol/tork/input"
	"github.com/runabol/tork/middleware/web"
)

type RequestBody struct {
	Type      string     `json:"type"`
	Table     string     `json:"table"`
	Record    Record     `json:"record"`
	Schema    string     `json:"schema"`
	OldRecord *OldRecord `json:"old_record"` // Use pointer to handle null values
}

// Record represents the record field in the payload
type Record struct {
	VT         time.Time `json:"vt"` // ISO 8601 timestamp
	MsgID      int       `json:"msg_id"`
	Message    Message   `json:"message"`
	ReadCT     int       `json:"read_ct"`
	EnqueuedAt time.Time `json:"enqueued_at"` // ISO 8601 timestamp
}

type OldRecord struct{}

// Message represents the message field in the record
type Message struct {
	Code     string `json:"code"`
	Language string `json:"language"`
}


func Handler(c web.Context) error {
	er := RequestBody{}

	if err := c.Bind(&er); err != nil {
		c.Error(http.StatusBadRequest, errors.Wrapf(err, "error binding request"))
		return nil
	}

	log.Debug().Msgf("%s", er.Record.Message.Code)

	task, err := buildTask(er)
	if err != nil {
		c.Error(http.StatusBadRequest, err)
		return nil
	}

	result := make(chan string)

	listener := func(j *tork.Job) {
		if j.State == tork.JobStateCompleted {
			result <- j.Execution[0].Result
		} else {
			result <- j.Execution[0].Error
		}
	}

	input := &input.Job{
		Name:  "code execution",
		Tasks: []input.Task{task},
	}

	job, err := engine.SubmitJob(c.Request().Context(), input, listener)

	if err != nil {
		c.Error(http.StatusBadRequest, errors.Wrapf(err, "error executing code"))
		return nil
	}

	log.Debug().Msgf("job %s submitted", job.ID)

	select {
	case r := <-result:
		return c.JSON(http.StatusOK, map[string]string{"output": r})
	case <-c.Done():
		return c.JSON(http.StatusGatewayTimeout, map[string]string{"message": "timeout"})
	}
}

func buildTask(er RequestBody) (input.Task, error) {
	var image string
	var run string
	var filename string

	log.Debug().Msgf("language: %s", er.Record.Message.Language)
	switch strings.TrimSpace(er.Record.Message.Language) {
	case "":
		return input.Task{}, errors.Errorf("require: language")
	case "python":
		image = "python:3"
		filename = "script.py"
		run = "python script.py > $TORK_OUTPUT"
	case "node":
		image = "node:16"
		filename = "script.js"
		run = "node script.js > $TORK_OUTPUT"
	case "java":
		image = "openjdk:17"
		filename = "Main.java"
		run = "javac Main.java && java Main > $TORK_OUTPUT"
	case "c++":
		image = "gcc:11"
		filename = "main.cpp"
		run = "g++ main.cpp -o main && ./main > $TORK_OUTPUT"
	case "go":
		image = "golang:1.19"
		filename = "main.go"
		run = "go run main.go > $TORK_OUTPUT"
	case "bash":
		image = "alpine:3.18.3"
		filename = "script"
		run = "sh ./script > $TORK_OUTPUT"
	default:
		return input.Task{}, errors.Errorf("unknown language: %s", er.Record.Message.Language)
	}

	return input.Task{
		Name:    "execute code",
		Image:   image,
		Run:     run,
		Timeout: "5s",
		Limits: &input.Limits{
			CPUs:   "1",
			Memory: "20m",
		},
		Files: map[string]string{
			filename: er.Record.Message.Code,
		},
	}, nil
}


func HealthCheck(c web.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func CORS(c web.Context) error {
	c.Response().Header().Set("Access-Control-Allow-Origin", "*")
	c.Response().Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type")
	return nil
}