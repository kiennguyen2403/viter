# Use Go version 1.22.7 or higher
FROM golang:1.23.3 AS builder

# Set work directory
WORKDIR /app

# Copy go.mod and go.sum and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code and build the application
COPY . .
RUN go build -o main .

# Runtime image with glibc support
FROM debian:bookworm-slim

# Install glibc (ensure compatibility)
RUN apt-get update && apt-get install -y libc6 && rm -rf /var/lib/apt/lists/*

# Add a non-root user
RUN useradd -m nonroot
USER nonroot:nonroot

# Copy the binary from the builder stage
COPY --from=builder /app/main /

# Add a health check (optional)
# HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
#     CMD ["/main", "health"] || exit 1

# Explicitly set the ENTRYPOINT to run the Go server
ENTRYPOINT ["/main"]

# You can also set the default CMD to run the server
CMD []
