# Use Go version 1.22.7 or higher
FROM golang:1.22.7 AS builder

# Set work directory
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Set the Go toolchain to auto-fetch updates
ENV GOTOOLCHAIN=auto

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN go build -o main .

# Runtime image
FROM gcr.io/distroless/base-debian10
COPY --from=builder /app/main /
CMD ["/main"]
