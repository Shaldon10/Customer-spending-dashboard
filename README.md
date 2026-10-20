# Customer Spending Dashboard

Customer Spending Dashboard is a web application for exploring a customer's spending, transactions, budgets, and profile. The frontend is an Angular application rendered with server-side rendering (SSR); an Express server provides the application's API endpoints. The current API is backed by sample data defined in the application, so it can be run locally without a separate database or external API service.

## 1. Tools and technologies used

- **Angular 22** — application framework, including routing, server-side rendering, and client hydration.
- **Nx 23** — monorepo tooling for building, serving, testing, and managing the application and feature libraries.
- **TypeScript 6** — application and server-side code.
- **Node.js 22 and Express 4** — server runtime, SSR hosting, static asset serving, and the sample `/api` endpoints.
- **SCSS** — application and component styling.
- **Axios and RxJS** — HTTP client and reactive programming support.
- **Jest 30** — unit test runner, configured through Nx and `jest-preset-angular`.
- **OpenAPI** — the API contract is in `capitech/openapi/customer-spending-api.yaml`; generated TypeScript API types are in `capitech/feature/data-access/generated-code/`.
- **Docker** — optional multi-stage container build and runtime, defined in the repository-root `Dockerfile`.

The dashboard includes customer overview, transactions, spending analysis, budget goals, and customer profile areas. Its current API implementation returns sample data; connect a real data service before using it with live customer information.

## 2. Build, test, and run

### Prerequisites

Install Node.js 22 (which includes npm). Docker is only needed if you want to use the container instructions below.

### Install dependencies

Run workspace commands from the `capitech` directory:

```sh
cd capitech
npm ci
```

`npm ci` installs the exact dependency versions recorded in `capitech/package-lock.json`.

### Run in development

From `capitech`:

```sh
npx nx serve capitech
```

Open <http://localhost:4200>. The development server serves the Angular application and its SSR/API integration.

### Build for production

From `capitech`:

```sh
npx nx build capitech --configuration=production
```

The build output is written to `capitech/dist/apps/capitech`. To run the built SSR server locally:

```sh
node dist/apps/capitech/server/server.mjs
```

The server listens on port `4000` by default. To change the port, set the `PORT` environment variable before starting it; for example, in PowerShell:

```powershell
$env:PORT = "8080"
node dist/apps/capitech/server/server.mjs
```

### Run tests

From `capitech`, run all Nx test targets:

```sh
npx nx run-many -t test
```

To test one project, replace the project name as needed:

```sh
npx nx test capitech
npx nx test customer-dashboard
npx nx test transactions
```

Other feature-library project names are `spending-analysis`, `budget-goals`, and `customer-profile`. Test coverage output is written under the repository-root `coverage/` directory.

### Run with Docker

Run these commands from the repository root:

```sh
docker build -t capitech .
docker run --rm -p 4000:4000 capitech
```

Open <http://localhost:4000>. To use another host port, change the left side of the port mapping (for example, `-p 8080:4000`).

## 3. Project structure

The repository contains the Dockerfile and this README at its root. The Nx workspace, application, and libraries are inside `capitech/`.

```text
.
├── Dockerfile                       # Multi-stage production container build
├── README.md
└── capitech/                        # Nx workspace root
    ├── package.json                 # Workspace dependencies and package metadata
    ├── package-lock.json            # Locked npm dependency versions
    ├── nx.json                      # Nx workspace configuration
    ├── apps/
    │   └── capitech/
    │       └── src/
    │           ├── app/             # Root component, routes, and app configuration
    │           ├── main.ts          # Browser application entry point
    │           ├── main.server.ts   # Server-rendering entry point
    │           ├── server.ts        # Express SSR server and API mounting
    │           └── mock-api.ts      # Sample-data API routes
    ├── feature/
    │   ├── customer-dashboard/      # Main customer dashboard view
    │   ├── transactions/            # Transaction list and related UI
    │   ├── spending-analysis/        # Spending summaries and category analysis
    │   ├── budget-goals/             # Budget and goal views
    │   ├── customer-profile/         # Customer profile view
    │   └── data-access/
    │       ├── facades/              # API access facade
    │       └── generated-code/       # TypeScript generated from the API contract
    ├── openapi/
    │   └── customer-spending-api.yaml # API specification
    └── dist/                         # Generated production build output
```

Each feature library contains its implementation under `src/`, with its own Nx project configuration and unit tests. Nx uses project names (such as `customer-dashboard`) in build and test commands.

## 4. Installing the required tools

### Node.js and npm

Install **Node.js 22** from <https://nodejs.org/> using the installer for your operating system. npm is included with Node.js; a separate npm installation is not required.

Check that both are available in a new terminal:

```sh
node --version
npm --version
```

Use Node.js 22 for local development to match the version used by the project’s Dockerfile.

### Docker (optional)

Docker is only required to build and run the container image. Install Docker Desktop for Windows or macOS, or Docker Engine for Linux, using the instructions at <https://docs.docker.com/get-docker/>. Confirm the installation with:

```sh
docker --version
```

### Nx and project dependencies

You do not need to install Nx globally. From the `capitech` directory, `npm ci` installs Nx and the Angular, TypeScript, and testing dependencies locally. Run Nx through `npx`, for example:

```sh
npx nx --version
```
