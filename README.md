# Smart-Office Asset Manager 🏢

Full Stack home assignment implementation: a containerized asset management system using **.NET 9**, **React (TypeScript)**, and **Docker Compose**.

This solution includes:
- **Identity & Auth Service** (.NET 9 + PostgreSQL)
- **Resource Management Service** (.NET 9 + MongoDB)
- **Frontend Dashboard** (ReactTS + MobX + MUI 5)
- **RBAC** (Admin / Member) enforced in both UI and backend

---

## Assignment Requirements Coverage
This project implements the requested architecture and endpoints:
- [x] Auth service with SQL DB and endpoints **POST /register**, **POST /login**
- [x] Resource service with **different DB type** (MongoDB) + JWT validation
- [x] Resource endpoints **GET /assets** (all roles), **POST /assets** (Admin only)
- [x] Frontend with **ReactTS + MobX + MUI 5** and “Add Asset” only for Admin
- [x] Full portability via `docker-compose up --build`
- [x] Documentation (Run Guide, Reflections, Tooling Disclosure)

---

## 🧱 Architecture Overview

**Microservices with strict data isolation**
- **Auth Service** owns identity data (users, hashed passwords, roles) in **PostgreSQL**.
- **Resource Service** owns assets data in **MongoDB**.
- Services do **not** share a database and are deployed together using **Docker Compose**.

**Security model**
- Auth service issues **JWT** containing: `userId` + `role`.
- Resource service independently validates the JWT signature and role on every request using a shared secret key.

---

## 🚀 Run Guide

### Prerequisites
- Docker Desktop installed + running.

### Execution
1. Open a terminal in the root directory.
2. Build and start the full stack:
   ```bash
   docker-compose up --build
Wait for the services to stabilize.

Access & Testing
Frontend: http://localhost:5173

Auth Swagger: http://localhost:5001/swagger

Resource Swagger: http://localhost:5002/swagger

Manual Verification Steps:

Register Admin: Go to /register, create a user, select role Admin.

Register Member: Create another user, select role Member.

Verify RBAC:

Login as Admin -> You will see the "Add New Asset" button on the dashboard.

Login as Member -> You will NOT see the "Add New Asset" button.

🧠 Reflections & Challenges

1. Security Considerations (Registration Logic)
Observation: Currently, the registration endpoint allows any user to self-assign the Admin role.


Reflection: While this implementation adheres to the assignment requirements  and facilitates easy testing of RBAC features, in a real-world production environment, this would be a critical vulnerability. Future Fix: Restrict Admin role assignment to database seeding or a dedicated internal CLI tool.

2. The "Split-Brain" Secret Key Issue
Problem: Initially, the Auth Service read the JWT Key from appsettings.json while the Resource Service read from Environment Variables. This caused signature validation failures (401 Unauthorized). Solution: Refactored both services to prioritize the JWT_SECRET environment variable injected by docker-compose. This enforces a Single Source of Truth configuration pattern.

3. Docker on Windows Filesystem
Problem: Encountered archive/tar: unknown file mode errors during build due to Windows file permissions. Solution: Sanitized the Dockerfiles and implemented .dockerignore to exclude local bin/obj folders from the build context.

🛠️ Tooling Disclosure
AI Assistants: Used for generating boilerplate MUI components and debugging Docker networking configurations.

Libraries: BCrypt.Net for hashing, MobX for state management, jwt-decode for client-side claim parsing.