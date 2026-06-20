# Employee Leave Management System (ELMS)

A production-style RESTful API for managing employee leave requests, built with **ASP.NET Core 8** following **Clean Architecture** principles. This project demonstrates real-world backend patterns used in enterprise software — Repository Pattern, Service Layer, JWT authentication, role-based authorization, and more.

> 🚧 **Status:** Actively in development. Currently on **Day 2 of an 18-day build plan** — Domain layer complete. Follow the daily commit history to see the project grow from the ground up.

---

## 📌 Why This Project

Companies that build enterprise software for banks, telecom, and government clients build HR modules like this constantly. This project is designed to mirror that real-world domain — multiple user roles, an approval workflow, balance tracking, and business rules that go beyond simple CRUD.

---

## 🏗️ Architecture

This project follows **Clean Architecture**, organized into four layers with a strict dependency rule — inner layers never depend on outer layers.

```
EmployeeLeaveMS.Domain          → Entities, Enums — zero external dependencies
EmployeeLeaveMS.Application     → Services, DTOs, Interfaces, AutoMapper profiles
EmployeeLeaveMS.Infrastructure  → EF Core, Repositories, JWT, Logging
EmployeeLeaveMS.API             → Controllers, Middleware, Swagger
```

| Layer | Depends On |
|---|---|
| Domain | Nothing |
| Application | Domain only |
| Infrastructure | Domain + Application |
| API | Application + Infrastructure |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | ASP.NET Core 8 |
| ORM | Entity Framework Core 8 |
| Database | SQL Server |
| Authentication | JWT + Refresh Tokens |
| Mapping | AutoMapper |
| Documentation | Swagger / Swashbuckle |
| Logging | Serilog |
| Testing | xUnit + Moq |
| Frontend (Phase 2) | React 18, Tailwind CSS |

---

## ✨ Planned Features

- 🔐 JWT authentication with refresh token rotation
- 👥 Role-based authorization — Employee, Manager, HR Admin
- 📝 Leave application with weekend-aware day calculation
- ✅ Manager approval/rejection workflow
- 📊 Leave balance tracking per employee, per leave type, per year
- 🔍 Pagination, filtering, and search on all list endpoints
- 🧱 Repository Pattern + Service Layer
- 🗂️ DTOs with AutoMapper — entities never leak to the API layer
- ⚠️ Global exception handling with structured error responses
- 📋 Full Swagger API documentation
- 🧪 Unit tested service layer (xUnit + Moq)

See [`SRS_EmployeeLeaveMS.pdf`](./docs/SRS_EmployeeLeaveMS.pdf) for the complete Software Requirements Specification.

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| **Employee** | Apply for leave, view own history, check own balance |
| **Manager** | All Employee permissions + approve/reject team requests |
| **HR Admin** | All permissions + manage employees, leave types, and balances |

---

## 🗄️ Database Design

| Table | Purpose |
|---|---|
| `Users` | Employees, managers, and admins |
| `Departments` | Groups employees under a manager |
| `LeaveTypes` | Annual, Sick, Casual, Unpaid — editable by Admin |
| `LeaveBalances` | Per-employee, per-type, per-year quota tracking |
| `LeaveRequests` | The application + approval workflow |
| `RefreshTokens` | Supports JWT auth without forcing frequent re-login |

---

## 📅 Build Progress

This project is being built **day by day**, with each day documented and committed individually — a transparent, real-time look at how the system comes together.

| Day | Status | Focus |
|---|---|---|
| Day 1 | ✅ Done | Project setup — solution, 4 projects, Clean Architecture references, NuGet packages |
| Day 2 | ✅ Done | Domain layer — BaseEntity, enums, and 6 core entities |
| Day 3 | ⬜ Upcoming | EF Core, AppDbContext, first migration |
| Day 4 | ⬜ Upcoming | Repository Pattern |
| Day 5 | ⬜ Upcoming | Auth — register, login, JWT |
| ... | ⬜ Upcoming | See full 18-day plan in the SRS document |

---

## 🚀 Getting Started

> Setup instructions will be added once the API is runnable (from Day 5 onward).

```bash
git clone https://github.com/YOUR_USERNAME/EmployeeLeaveMS-Backend.git
cd EmployeeLeaveMS-Backend
dotnet build
```

---

## 📂 Project Structure

```
EmployeeLeaveMS_Backend/
├── src/
│   ├── EmployeeLeaveMS.Domain/
│   │   ├── Common/          → BaseEntity
│   │   ├── Entities/        → User, LeaveRequest, LeaveBalance, etc.
│   │   └── Enums/           → UserRole, LeaveStatus
│   ├── EmployeeLeaveMS.Application/
│   ├── EmployeeLeaveMS.Infrastructure/
│   └── EmployeeLeaveMS.API/
└── EmployeeLeaveMS.sln
```

---

## 👤 Author

**Ibrahim**
Junior .NET Developer | Islamabad, Pakistan
Building this project as a portfolio piece while seeking my first junior .NET developer role.

🔗 [LinkedIn](#) — following a 30-day public build challenge documenting this project's progress.

---

## 📄 License

This project is for portfolio and educational purposes.
