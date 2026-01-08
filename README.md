# Smart-Office Asset Manager 🏢

A containerized asset management system using **.NET 9**, **React (TypeScript)**, and **Docker Compose**.

---

## ✅ Assignment Requirements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Two microservices | ✅ | Auth Service + Resource Service |
| Auth with SQL DB | ✅ | PostgreSQL via EF Core |
| Resource with different DB | ✅ | MongoDB |
| JWT with userId + role | ✅ | Claims: `sub`, `role`, `FullName` |
| POST /register, /login | ✅ | `AuthController.cs` |
| GET /assets (all roles) | ✅ | Paginated endpoint |
| POST /assets (Admin only) | ✅ | `[Authorize(Roles="Admin")]` |
| React + TypeScript + MobX + MUI | ✅ | Frontend stack |
| docker-compose portability | ✅ | Single command startup |

---

## 🏗 Architecture

```
┌─────────────┐     JWT      ┌──────────────────┐
│   Frontend  │─────────────▶│   Auth Service   │──▶ PostgreSQL
│  (React)    │              │   (.NET 9)       │
└──────┬──────┘              └──────────────────┘
       │ JWT
       ▼
┌──────────────────┐
│ Resource Service │──▶ MongoDB
│   (.NET 9)       │
└──────────────────┘
```

- **Auth Service**: User registration, login, JWT generation (BCrypt hashing)
- **Resource Service**: Asset CRUD, booking logic, statistics
- **Frontend**: Dashboard with role-based UI (Admin sees "Add Asset" button)

---

## 🚀 Run Guide

```bash
# Start everything
docker-compose up --build

# Access points
Frontend:         http://localhost:5173
Auth Swagger:     http://localhost:5001/swagger
Resource Swagger: http://localhost:5002/swagger
```

### Testing RBAC
1. Register as **Admin** at `/register`
2. Register as **Member** (different browser/incognito)
3. Admin sees "Add New Asset" button; Member does not

---

## 📡 API Reference

### Auth Service (`:5001`)
| Endpoint | Method | Body | Returns |
|----------|--------|------|---------|
| `/api/auth/register` | POST | `{username, password, fullName, role}` | JWT |
| `/api/auth/login` | POST | `{username, password}` | JWT |

### Resource Service (`:5002`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/assets` | GET | Any | Paginated list (`?page=1&pageSize=12`) |
| `/api/assets/{id}` | GET | Any | Single asset |
| `/api/assets/stats` | GET | Any | `{total, available, inUse}` |
| `/api/assets` | POST | Admin | Create asset |
| `/api/assets/{id}` | PUT | Any | Book/Release (atomic) |
| `/api/assets/{id}` | DELETE | Admin | Delete asset |

---

## 🔧 Technical Decisions

### 1. Atomic Booking (Race Condition Fix)
**Problem**: Two users clicking "Book" simultaneously could both succeed.  
**Solution**: Implemented `TryBookAssetAsync` using MongoDB's atomic `UpdateOne` with filter `{IsAvailable: true}`. If another user books first, the operation returns `ModifiedCount: 0` → returns `409 Conflict`.

### 2. JWT Secret Configuration
**Problem**: Hardcoded secrets are a security risk.  
**Solution**: Removed fallback defaults. App throws `InvalidOperationException` if `JWT_SECRET` env var is missing. This forces proper configuration.

### 3. Database-Side Pagination
**Problem**: Loading all assets crashes browser with large datasets.  
**Solution**: MongoDB `Skip/Limit` before `ToListAsync()` ensures O(1) memory regardless of dataset size.

---

## 🧠 Reflections

### Security: Self-Assigned Admin Role
The registration endpoint allows role selection for easy testing. In production, this would be restricted to seed scripts or internal tools.

### Concurrency: Booking Logic
Previous "read-then-write" pattern had race conditions. Now uses atomic MongoDB updates with conditional filters.

### Configuration: Split-Brain JWT Keys
Initially, Auth and Resource services read JWT secrets from different sources (appsettings vs env). Fixed by enforcing environment variable as single source of truth.

---

## ✨ Extra Features (Beyond Requirements)

| Feature | Description |
|---------|-------------|
| **Pagination** | Server-side `Skip/Limit` pagination with page controls in UI |
| **Dashboard Statistics** | Live widget counters (Total/Available/In Use) with click-to-filter |
| **Full Name Display** | JWT includes `FullName` claim; shown in navbar greeting |
| **Atomic Booking** | Race-condition-safe booking using MongoDB conditional updates |
| **Admin Pre-Booking** | Admins can create assets as "In Use" with manual name (e.g., "Guest: CEO") |
| **Glassmorphism UI** | Modern CSS with backdrop blur, gradients, and animations |
| **Database Seeding** | Auto-seeds 6 demo assets on first startup |
| **Swagger Documentation** | Both services expose `/swagger` with JWT auth support |
| **Centralized API Config** | Frontend uses `config/api.ts` with env variable support |
| **Comprehensive Tests** | Unit tests for AuthService, AssetsController, and RegisterPage |

---

## 🧪 Running Tests

```bash
# Backend (from project root)
cd backend/auth-service && dotnet test
cd backend/resource-service && dotnet test

# Frontend
cd frontend && npm test
```

---

## 🛠 Stack

**Backend**: .NET 9, EF Core, MongoDB.Driver, BCrypt.Net  
**Frontend**: React 19, TypeScript, MobX, MUI v5, Vite  
**Infrastructure**: Docker Compose, PostgreSQL 15, MongoDB 7
