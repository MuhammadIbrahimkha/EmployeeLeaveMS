# Employee Leave Management System (ELMS)

A production-style RESTful API for managing employee leave requests, built with **ASP.NET Core 8** following **Clean Architecture** principles. This project demonstrates real-world backend patterns used in enterprise software — Repository Pattern, Service Layer, JWT authentication, role-based authorization, AutoMapper, pagination, structured logging, and unit testing.

> ✅ **Status: Backend Complete (v1.0)** — All 13 planned backend days finished. Phase 2 (React frontend) begins next.

---

## 📌 Why This Project

Companies that build enterprise software for banks, telecom, and government clients build HR modules like this constantly. This project mirrors that real-world domain — multiple user roles, an approval workflow, balance tracking, and business rules that go beyond simple CRUD.

---

## 🏗️ Architecture

This project follows **Clean Architecture**, organized into four layers with a strict dependency rule — inner layers never depend on outer layers.

```
EmployeeLeaveMS.Domain          → Entities, Enums, Exceptions — zero external dependencies
EmployeeLeaveMS.Application     → Services, DTOs, Interfaces, AutoMapper profiles, Validation
EmployeeLeaveMS.Infrastructure  → EF Core, Repositories, JWT, Serilog
EmployeeLeaveMS.API             → Controllers, Middleware, Swagger
EmployeeLeaveMS.Tests           → xUnit + Moq unit tests for the Application layer
```

| Layer | Depends On |
|---|---|
| Domain | Nothing |
| Application | Domain only |
| Infrastructure | Domain + Application |
| API | Application + Infrastructure |
| Tests | Application only |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | ASP.NET Core 8 |
| ORM | Entity Framework Core 8 |
| Database | SQL Server |
| Authentication | JWT + Refresh Tokens with rotation |
| Mapping | AutoMapper |
| Documentation | Swagger / Swashbuckle |
| Logging | Serilog (console + rolling file) |
| Testing | xUnit + Moq |
| Frontend (Phase 2) | React 18, Tailwind CSS |

---

## ✨ Features

- 🔐 JWT authentication with refresh token rotation and revoke-on-login security
- 👥 Role-based authorization — Employee, Manager, HR Admin
- 📝 Leave application with weekend-aware working day calculation
- ✅ Manager approval/rejection workflow with atomic balance deduction
- 📊 Leave balance tracking per employee, per leave type, per year
- 🏢 Department management with manager assignment
- 📋 Leave type management with soft delete
- 🔍 Pagination, filtering (status, date range, leave type), and search (name/email) on all list endpoints
- 🧱 Repository Pattern + Unit of Work for atomic multi-entity transactions
- 🗂️ AutoMapper — entities never leak to the API layer
- ⚠️ Global exception handling with custom exception hierarchy and structured JSON responses
- ✔️ Data Annotation validation on all DTOs with consistent error response shape
- 📋 Structured logging via Serilog — request logging, error logging, request/user context
- 📑 Full Swagger API documentation with JWT bearer auth support
- 🧪 Unit tested service layer (xUnit + Moq) — 9+ tests covering auth and leave business logic

See [`SRS_EmployeeLeaveMS.pdf`](./docs/SRS_EmployeeLeaveMS.pdf) for the complete Software Requirements Specification.

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| **Employee** | Apply for leave, view own history, check own balance, cancel pending requests |
| **Manager** | All Employee permissions + approve/reject team requests |
| **HR Admin** | All permissions + manage employees, leave types, balances, and departments |

---

## 🗄️ Database Design

| Table | Purpose |
|---|---|
| `Users` | Employees, managers, and admins (self-referencing Manager relationship) |
| `Departments` | Groups employees under a manager |
| `LeaveTypes` | Annual, Sick, Casual, Unpaid — editable by Admin, soft delete |
| `LeaveBalances` | Per-employee, per-type, per-year quota tracking |
| `LeaveRequests` | The application + approval workflow |
| `RefreshTokens` | Supports JWT auth without forcing frequent re-login |

---

## 📅 Build Progress — Complete

| Day | Focus | Status |
|---|---|---|
| Day 1 | Project setup — Clean Architecture solution | ✅ |
| Day 2 | Domain layer — entities, enums | ✅ |
| Day 3 | EF Core, migrations, seed data | ✅ |
| Day 4 | Repository Pattern + Unit of Work | ✅ |
| Day 5 | JWT authentication, BCrypt password hashing | ✅ |
| Day 6 | Global exception handling, Serilog logging | ✅ |
| Day 7 | Role-based authorization, leave workflow | ✅ |
| Day 8 | Leave type, balance, and department management | ✅ |
| Day 9 | AutoMapper refactor | ✅ |
| Day 10 | Pagination, filtering, search | ✅ |
| Day 11 | Unit testing — xUnit + Moq | ✅ |
| Day 12 | Swagger documentation polish | ✅ |
| Day 13 | Final cleanup — validation, full regression sweep | ✅ |

**Backend is feature-complete and ready for the React frontend (Phase 2).**

---

## 🚀 Getting Started

```bash
git clone https://github.com/MuhammadIbrahimkha/EmployeeLeaveMS.git
cd EmployeeLeaveMS-Backend

# Restore and build
dotnet restore
dotnet build

# Apply migrations (requires local SQL Server)
dotnet ef database update --project src/EmployeeLeaveMS.Infrastructure --startup-project src/EmployeeLeaveMS.API

# Run the API
dotnet run --project src/EmployeeLeaveMS.API

# Run unit tests
dotnet test
```

Swagger UI available at `https://localhost:{port}/swagger` once running.

> ⚠️ You'll need your own `appsettings.Development.json` with a real connection string and JWT secret key — see `appsettings.json` for the required structure (values are intentionally placeholders for security).

---

## 📂 Project Structure

```
EmployeeLeaveMS_Backend/
├── src/
│   ├── EmployeeLeaveMS.Domain/
│   │   ├── Common/          → BaseEntity
│   │   ├── Entities/        → User, LeaveRequest, LeaveBalance, etc.
│   │   ├── Enums/           → UserRole, LeaveStatus
│   │   └── Exceptions/      → NotFoundException, ValidationException, etc.
│   ├── EmployeeLeaveMS.Application/
│   │   ├── DTOs/            → Auth, Leave, Admin, Common (pagination)
│   │   ├── Interfaces/      → Repositories, Services
│   │   ├── Services/        → AuthService, LeaveService, AdminService, LeaveTypeService
│   │   ├── Mappings/        → AutoMapper MappingProfile
│   │   ├── Helpers/         → DateHelper
│   │   └── Extensions/      → Pagination extension methods
│   ├── EmployeeLeaveMS.Infrastructure/
│   │   ├── Data/             → AppDbContext, Configurations
│   │   ├── Repositories/     → All repository implementations
│   │   ├── Helpers/          → JwtHelper, PasswordHasher
│   │   └── Migrations/
│   ├── EmployeeLeaveMS.API/
│   │   ├── Controllers/      → Auth, Leave, LeaveType, Admin
│   │   ├── Middleware/       → GlobalExceptionMiddleware, RequestLoggingMiddleware
│   │   ├── Services/         → CurrentUserService
│   │   └── Models/           → ErrorResponse
│   └── EmployeeLeaveMS.Tests/
│       └── Services/         → AuthServiceTests, LeaveServiceTests
└── EmployeeLeaveMS_Backend.sln
```

---

## 👤 Author

**Ibrahim**
Junior .NET Developer | Islamabad, Pakistan
Built this project day-by-day as a portfolio piece while seeking a junior .NET developer role.

🔗 [LinkedIn](#) — followed a public 30-day build challenge documenting this project's progress from Day 1 to backend completion.

---

## 📄 License

This project is for portfolio and educational purposes.
