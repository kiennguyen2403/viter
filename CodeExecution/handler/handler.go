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

type ExecRequest struct {
	Code     string `json:"code"`
	Language string `json:"language"`
}

func Handler(c web.Context) error {
	log.Debug().Msg("Received execute request")
	er := ExecRequest{}

	if err := c.Bind(&er); err != nil {
		log.Error().Err(err).Msg("Error binding request")
		c.Error(http.StatusBadRequest, errors.Wrapf(err, "error binding request"))
		return nil
	}

	log.Debug().
		Str("language", er.Language).
		Str("code", er.Code).
		Msg("Processing code execution request")

	task, err := buildTask(er)
	if err != nil {
		log.Error().Err(err).Msg("Error building task")
		c.Error(http.StatusBadRequest, err)
		return nil
	}

	result := make(chan string)
	done := make(chan bool)

	listener := func(j *tork.Job) {
		log.Debug().
			Str("jobID", j.ID).
			Str("state", string(j.State)).
			Msg("Job state update")

		if j.State == tork.JobStateCompleted {
			result <- j.Execution[0].Result
		} else if j.State == tork.JobStateFailed {
			result <- j.Execution[0].Error
		}
	}

	input := &input.Job{
		Name:  "code execution",
		Tasks: []input.Task{task},
	}

	job, err := engine.SubmitJob(c.Request().Context(), input, listener)
	if err != nil {
		log.Error().Err(err).Msg("Error submitting job")
		c.Error(http.StatusBadRequest, errors.Wrapf(err, "error executing code"))
		return nil
	}

	log.Debug().Str("jobID", job.ID).Msg("Job submitted")

	// Add timeout handling
	go func() {
		time.Sleep(25 * time.Second)
		done <- true
	}()

	select {
	case r := <-result:
		log.Debug().Str("output", r).Msg("Received result")
		return c.JSON(http.StatusOK, map[string]string{"output": r})
	case <-done:
		log.Warn().Msg("Job execution timed out")
		return c.JSON(http.StatusGatewayTimeout, map[string]string{"message": "execution timed out"})
	case <-c.Done():
		log.Warn().Msg("Client connection closed")
		return c.JSON(http.StatusGatewayTimeout, map[string]string{"message": "client connection closed"})
	}
}

func buildTask(er ExecRequest) (input.Task, error) {
	log.Debug().
		Str("language", er.Language).
		Msg("Building task for language")

	if er.Code == "" {
		return input.Task{}, errors.New("code cannot be empty")
	}

	var image string
	var run string
	var filename string

	switch strings.TrimSpace(strings.ToLower(er.Language)) {
	case "":
		return input.Task{}, errors.New("language cannot be empty")
	case "python":
		image = "python:3"
		filename = "script.py"
		run = "python script.py > $TORK_OUTPUT 2>&1"
	case "node":
		image = "node:16"
		filename = "script.js"
		run = "node script.js > $TORK_OUTPUT 2>&1"
	case "ruby":
		image = "ruby:3"
		filename = "script.rb"
		run = "ruby script.rb > $TORK_OUTPUT"
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
		return input.Task{}, errors.Errorf("unsupported language: %s", er.Language)
	}

	return input.Task{
		Name:    "execute code",
		Image:   image,
		Run:     run,
		Timeout: "20s",
		Limits: &input.Limits{
			CPUs:   "1",
			Memory: "50m",
		},
		Files: map[string]string{
			filename: er.Code,
		},
	}, nil
}
