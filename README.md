# Customer-spending-dashboard
Production-ready customer spending insights dashboard built with Angular, Nx, OpenAPI, Facades, and CI/CD.

## Run with Docker

Build and start the application from the repository root:

```sh
docker build -t capitech .
docker run --rm -p 4000:4000 capitech
```

Then open <http://localhost:4000>. To use a different host port, change the
left side of the port mapping (for example, `-p 8080:4000`).
