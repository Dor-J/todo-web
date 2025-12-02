# todo-web

Full-stack Todo application with Angular frontend and .NET backend, backed by Azure Cosmos DB.

## Prerequisites

### Frontend
- Node.js (v18 or higher recommended)
- npm (v11.5.1 or compatible)

### Backend
- .NET 8 SDK
- Azure Cosmos DB for NoSQL account

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (see [Environment Variables](#environment-variables) section below).

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure Cosmos settings locally (user secrets recommended):
   ```bash
   dotnet user-secrets init
   dotnet user-secrets set "Cosmos:ConnectionString" "<your-connection-string>"
   ```
   Optional overrides: `Cosmos:DatabaseId` (default `TodoDb`), `Cosmos:ContainerId` (default `Todos`), `Cosmos:PartitionKeyPath` (default `/id`).

3. Restore dependencies:
   ```bash
   dotnet restore
   ```

## Frontend Status

- Angular 21 application with modern standalone components and signals-based state management.
- Styled with Tailwind CSS for a polished, modern, and responsive UI.
- Component-based architecture with reusable UI components (header, footer, modals, dialogs, toasts, etc.).
- State management via Angular signals in `TodoStore` service with computed values for filtering and statistics.
- Features:
  - Add, edit, delete todos
  - Mark todos as complete/incomplete
  - Filter todos by status (all/active/completed) and search by title/description
  - Real-time statistics (total, completed, remaining)
  - Loading states and error handling
  - Toast notifications for user feedback
- Testing setup with Vitest.
- Environment variables managed via `@ngx-env/builder` (injected at build time).

## Backend Status

- ASP.NET Core minimal API plus controller for health checks.
- CRUD endpoints backed by Azure Cosmos DB (SQL API) via `CosmosTodoRepository`.
- Todo schema: `id`, `title`, `description`, `isCompleted`, `createdAt`, `updatedAt`, `completedAt`.
- Automated Cosmos database/container provisioning on startup.
- CORS configured to allow frontend origin (`http://localhost:4200` by default).

## Run the Frontend Locally

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm start
   ```
   Or use the specific configuration:
   ```bash
   npm run start:local      # Development mode (default)
   npm run start:development # Development mode
   npm run start:production  # Production mode
   ```

3. Open your browser and navigate to `http://localhost:4200/`.

The application will automatically reload whenever you modify any of the source files.

### Build for Production

To build the project for production:
```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory.

### Run Tests

To execute unit tests with Vitest:
```bash
npm test
```

## Run the Backend Locally

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the application:
   ```bash
   dotnet run
   ```

The backend will start on `http://localhost:5013` (or `https://localhost:7221` for HTTPS). On startup, the app ensures the Cosmos database and container exist.

Use Swagger (`/swagger` in Development) for interactive API documentation.

## Environment Variables

### Frontend Environment Variables

The frontend uses `@ngx-env/builder` to inject environment variables at build time. Variables must be prefixed with `NG_APP_` and are accessed via `import.meta.env` in the code.

#### Required Variables

- `NG_APP_API_URL`: Backend API base URL
  - Default: `http://localhost:3000/api` (incorrect - should be configured)
  - Recommended: `http://localhost:5013` (matches default backend port)
  - Example: `http://localhost:5013` or `https://your-api.azurewebsites.net`

- `NG_APP_TODO_ENDPOINT`: Todo endpoint path
  - Default: `/todos`
  - Usually no need to change unless backend uses a different path

#### Optional Variables

- `NG_APP_API_URL_HTTPS`: HTTPS version of the API URL (if different from `NG_APP_API_URL`)

#### Setting Environment Variables

**Option 1: Using a `.env` file** (recommended for local development)

Create a `.env` file in the `frontend` directory:

```bash
NG_APP_API_URL=http://localhost:5013
NG_APP_TODO_ENDPOINT=/todos
```

**Option 2: Using environment variables**

Set variables before running npm commands:

```bash
# Windows (PowerShell)
$env:NG_APP_API_URL="http://localhost:5013"; npm start

# Windows (CMD)
set NG_APP_API_URL=http://localhost:5013 && npm start

# Linux/macOS
NG_APP_API_URL=http://localhost:5013 npm start
```

**Important Notes:**
- Environment variables are injected at build time, not runtime.
- You may need to restart the dev server after changing environment variables.
- The `.env` file should be added to `.gitignore` (already configured) to avoid committing secrets.

### Backend Environment Variables

Backend configuration uses .NET user secrets (recommended) or `appsettings.json`:

**User Secrets (Recommended):**
```bash
cd backend
dotnet user-secrets set "Cosmos:ConnectionString" "<your-connection-string>"
```

**Optional Cosmos Settings:**
- `Cosmos:DatabaseId` (default: `TodoDb`)
- `Cosmos:ContainerId` (default: `Todos`)
- `Cosmos:PartitionKeyPath` (default: `/id`)

**CORS Configuration:**
Configure allowed origins in `appsettings.json`:
```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:4200"
    ]
  }
}
```

## REST API

| Method | Route          | Description                       |
| ------ | -------------- | --------------------------------- |
| GET    | `/todos`       | List all todos                    |
| GET    | `/todos/{id}`  | Fetch a todo by id                |
| POST   | `/todos`       | Create a todo                     |
| PUT    | `/todos/{id}`  | Update title/description/status   |
| DELETE | `/todos/{id}`  | Remove a todo                     |
| GET    | `/api/health`  | Returns `{ status: "Healthy" }` or `503` if unhealthy |

Use Swagger (`/swagger` in Development) for interactive docs. All endpoints read/write Cosmos documents through `ITodoRepository`.
