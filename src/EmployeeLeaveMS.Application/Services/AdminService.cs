using EmployeeLeaveMS.Application.DTOs;
using EmployeeLeaveMS.Application.DTOs.Admin;
using EmployeeLeaveMS.Application.Interfaces;
using EmployeeLeaveMS.Application.Interfaces.Services;
using EmployeeLeaveMS.Domain.Entities;

namespace EmployeeLeaveMS.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AdminService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // ── Employee Management ────────────────────────────────────────────

        public async Task<ServiceResult<IEnumerable<EmployeeDto>>> GetAllEmployeesAsync()
        {
            var employees = await _unitOfWork.Users.GetAllEmployeesAsync();

            var dtos = employees.Select(u => MapToEmployeeDto(u));

            return ServiceResult<IEnumerable<EmployeeDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<EmployeeDto>> GetEmployeeByIdAsync(Guid id)
        {
            var employee = await _unitOfWork.Users.GetByIdWithDetailsAsync(id);

            if (employee is null)
                return ServiceResult<EmployeeDto>.Fail("Employee not found.");

            return ServiceResult<EmployeeDto>.Ok(MapToEmployeeDto(employee));
        }

        // ── Leave Balance Management ───────────────────────────────────────

        public async Task<ServiceResult<LeaveBalanceAdminDto>> AssignLeaveBalanceAsync(
            AssignLeaveBalanceDto dto)
        {
            // 1. Validate employee exists
            var employee = await _unitOfWork.Users.GetByIdAsync(dto.EmployeeId);
            if (employee is null)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Employee not found.");

            // 2. Validate leave type exists and is active
            var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(dto.LeaveTypeId);
            if (leaveType is null || !leaveType.IsActive)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Leave type not found or is deactivated.");

            // 3. Validate year
            if (dto.Year < DateTime.UtcNow.Year)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Cannot assign balance for a past year.");

            // 4. Check if balance already exists for this employee/type/year
            var existing = await _unitOfWork.LeaveBalances
                .GetByEmployeeAndTypeAsync(dto.EmployeeId, dto.LeaveTypeId, dto.Year);

            if (existing is not null)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    $"Balance for this leave type and year already exists. " +
                    $"Use the update endpoint to modify it.");

            // 5. Validate total days
            if (dto.TotalDays <= 0)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Total days must be greater than zero.");

            // 6. Create the balance
            var balance = new LeaveBalance
            {
                Id = Guid.NewGuid(),
                EmployeeId = dto.EmployeeId,
                LeaveTypeId = dto.LeaveTypeId,
                TotalDays = dto.TotalDays,
                UsedDays = 0,
                Year = dto.Year,
                CreatedAt = DateTime.UtcNow,
            };

            await _unitOfWork.LeaveBalances.AddAsync(balance);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<LeaveBalanceAdminDto>.Ok(
                MapToBalanceAdminDto(balance, employee.FullName, leaveType.Name),
                "Leave balance assigned successfully.");
        }

        public async Task<ServiceResult<LeaveBalanceAdminDto>> UpdateLeaveBalanceAsync(
            Guid balanceId, UpdateLeaveBalanceDto dto)
        {
            // 1. Find the balance
            var balance = await _unitOfWork.LeaveBalances.GetByIdAsync(balanceId);
            if (balance is null)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Leave balance not found.");

            // 2. Validate new total days
            if (dto.TotalDays <= 0)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Total days must be greater than zero.");

            // 3. Cannot set total days below already used days
            if (dto.TotalDays < balance.UsedDays)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    $"Cannot set total days ({dto.TotalDays}) below already " +
                    $"used days ({balance.UsedDays}).");

            // 4. Update
            balance.TotalDays = dto.TotalDays;
            balance.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.LeaveBalances.Update(balance);
            await _unitOfWork.SaveChangesAsync();

            // 5. Fetch employee and leave type names for the response
            var employee = await _unitOfWork.Users.GetByIdAsync(balance.EmployeeId);
            var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(balance.LeaveTypeId);

            return ServiceResult<LeaveBalanceAdminDto>.Ok(
                MapToBalanceAdminDto(
                    balance,
                    employee?.FullName ?? string.Empty,
                    leaveType?.Name ?? string.Empty),
                "Leave balance updated successfully.");
        }

        public async Task<ServiceResult<IEnumerable<LeaveBalanceAdminDto>>>
            GetEmployeeBalancesAsync(Guid employeeId, int year)
        {
            // 1. Validate employee exists
            var employee = await _unitOfWork.Users.GetByIdAsync(employeeId);
            if (employee is null)
                return ServiceResult<IEnumerable<LeaveBalanceAdminDto>>.Fail(
                    "Employee not found.");

            // 2. Get all balances for this employee and year
            var balances = await _unitOfWork.LeaveBalances
                .GetByEmployeeAsync(employeeId, year);

            var dtos = balances.Select(b => MapToBalanceAdminDto(
                b,
                employee.FullName,
                b.LeaveType?.Name ?? string.Empty));

            return ServiceResult<IEnumerable<LeaveBalanceAdminDto>>.Ok(dtos);
        }

        // ── Department Management ──────────────────────────────────────────

        public async Task<ServiceResult<IEnumerable<DepartmentDto>>> GetAllDepartmentsAsync()
        {
            var departments = await _unitOfWork.Departments.GetAllWithDetailsAsync();

            var dtos = departments.Select(d => MapToDepartmentDto(d));

            return ServiceResult<IEnumerable<DepartmentDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<DepartmentDto>> CreateDepartmentAsync(
            CreateDepartmentDto dto)
        {
            // 1. Check name is unique
            var nameExists = await _unitOfWork.Departments.NameExistsAsync(dto.Name);
            if (nameExists)
                return ServiceResult<DepartmentDto>.Fail(
                    $"A department named '{dto.Name}' already exists.");

            // 2. Validate manager if provided
            if (dto.ManagerId.HasValue)
            {
                var manager = await _unitOfWork.Users.GetByIdAsync(dto.ManagerId.Value);
                if (manager is null)
                    return ServiceResult<DepartmentDto>.Fail(
                        "Specified manager not found.");
            }

            // 3. Create department
            var department = new Department
            {
                Id = Guid.NewGuid(),
                Name = dto.Name.Trim(),
                ManagerId = dto.ManagerId,
                CreatedAt = DateTime.UtcNow,
            };

            await _unitOfWork.Departments.AddAsync(department);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<DepartmentDto>.Ok(
                MapToDepartmentDto(department),
                "Department created successfully.");
        }

        public async Task<ServiceResult<DepartmentDto>> AssignManagerAsync(
            Guid departmentId, Guid managerId)
        {
            // 1. Find department
            var department = await _unitOfWork.Departments.GetByIdAsync(departmentId);
            if (department is null)
                return ServiceResult<DepartmentDto>.Fail(
                    "Department not found.");

            // 2. Find and validate manager
            var manager = await _unitOfWork.Users.GetByIdAsync(managerId);
            if (manager is null)
                return ServiceResult<DepartmentDto>.Fail(
                    "User not found.");

            // 3. Assign
            department.ManagerId = managerId;
            department.UpdatedAt = DateTime.UtcNow;

            // 4. Also update the manager's own DepartmentId if not already set
            if (manager.DepartmentId != departmentId)
            {
                manager.DepartmentId = departmentId;
                manager.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Users.Update(manager);
            }

            _unitOfWork.Departments.Update(department);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<DepartmentDto>.Ok(
                MapToDepartmentDto(department),
                $"Manager assigned to department successfully.");
        }

        // ── Private Mappers ────────────────────────────────────────────────

        private static EmployeeDto MapToEmployeeDto(User u) => new()
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Role = u.Role.ToString(),
            DepartmentName = u.Department?.Name ?? string.Empty,
            ManagerName = u.Manager?.FullName,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt,
        };

        private static LeaveBalanceAdminDto MapToBalanceAdminDto(
            LeaveBalance b, string employeeName, string leaveTypeName) => new()
            {
                Id = b.Id,
                EmployeeId = b.EmployeeId,
                EmployeeName = employeeName,
                LeaveTypeName = leaveTypeName,
                TotalDays = b.TotalDays,
                UsedDays = b.UsedDays,
                RemainingDays = b.RemainingDays,
                Year = b.Year,
            };

        private static DepartmentDto MapToDepartmentDto(Department d) => new()
        {
            Id = d.Id,
            Name = d.Name,
            ManagerName = d.Manager?.FullName,
            EmployeeCount = d.Employees?.Count(e => e.IsActive) ?? 0,
            CreatedAt = d.CreatedAt,
        };
    }
}