# Task: full-stack Todo application using

1. Frontend - Angular

   1. You may use any UI kit => Tailwind
   2. The design be polished, modern, and responsive
   3. Avoid overly minimal "default" styling

2. Backend - .NET (C#)
   Should expose a clean REST API for CRUD operations on todos.

   - Expose a REST API with endpoints for CRUD operations:
     1. GET /todos
     2. GET /todos/{id}
     3. POST /todos
     4. PUT /todos/{id}
     5. DELETE /todos/{id}
   - Connect to Azure Cosmos DB for data persistence
   - Use environment variables / app settings (no secrets in git).

3. Database - Azure Cosmos DB
   Use any preferred API (SQL API recommended).

   - Use Azure Cosmos DB (SQL API preferred).
   - A todo item should include:
     - id
     - title
     - isCompleted
     - createdAt
     - Any additional fields you choose

4. Features:

   1. Add a new todo
   2. Edit an existing todo
   3. Mark as complete / incomplete
   4. Delete a todo
   5. Display a list of todos
   6. filters (completed / active)

5. Repo setup
   1. Root-level README.md
      1. Setup instructions
      2. How to run the frontend locally
      3. How to run the backend locally
      4. How to configure environment variables
   2. Project structure
      1. client/ or frontend/ for Angular
      2. server/ or backend/ for .NET
      3. No secrets checked into Git
6. Deployment:
   - Backend
     1. deployed to Azure App Service
     2. run successfully with the Cosmos DB connection string
     3. return responses publicly via an accessible API URL
   - Frontend
     - Connect to the deployed API
