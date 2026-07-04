using AutoMapper;
using EmployeeLeaveMS.Application.DTOs;
using EmployeeLeaveMS.Application.DTOs.Admin;
using EmployeeLeaveMS.Application.DTOs.Common;
using EmployeeLeaveMS.Application.DTOs.Leave;
using EmployeeLeaveMS.Application.Extensions;
using EmployeeLeaveMS.Application.Interfaces;
using EmployeeLeaveMS.Application.Interfaces.Services;
using EmployeeLeaveMS.Domain.Entities;

namespace EmployeeLeaveMS.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AdminService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResult<IEnumerable<EmployeeDto>>> GetAllEmployeesAsync()
        {
            var employees = await _unitOfWork.Users.GetAllEmployeesAsync();
            var dtos = _mapper.Map<IEnumerable<EmployeeDto>>(employees);
            return ServiceResult<IEnumerable<EmployeeDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<EmployeeDto>> GetEmployeeByIdAsync(Guid id)
        {
            var employee = await _unitOfWork.Users.GetByIdWithDetailsAsync(id);
            if (employee is null)
                return ServiceResult<EmployeeDto>.Fail("Employee not found.");

            return ServiceResult<EmployeeDto>.Ok(
                _mapper.Map<EmployeeDto>(employee));
        }

        public async Task<ServiceResult<LeaveBalanceAdminDto>> AssignLeaveBalanceAsync(
            AssignLeaveBalanceDto dto)
        {
            var employee = await _unitOfWork.Users.GetByIdAsync(dto.EmployeeId);
            if (employee is null)
                return ServiceResult<LeaveBalanceAdminDto>.Fail("Employee not found.");

            var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(dto.LeaveTypeId);
            if (leaveType is null || !leaveType.IsActive)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Leave type not found or is deactivated.");

            if (dto.Year < DateTime.UtcNow.Year)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Cannot assign balance for a past year.");

            var existing = await _unitOfWork.LeaveBalances
                .GetByEmployeeAndTypeAsync(dto.EmployeeId, dto.LeaveTypeId, dto.Year);
            if (existing is not null)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Balance for this leave type and year already exists. " +
                    "Use the update endpoint to modify it.");

            if (dto.TotalDays <= 0)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Total days must be greater than zero.");

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

            // Reload with navigation properties so AutoMapper can read
            // Employee.FullName and LeaveType.Name correctly
            var savedBalance = await _unitOfWork.LeaveBalances
                .GetByEmployeeAndTypeAsync(
                    balance.EmployeeId,
                    balance.LeaveTypeId,
                    balance.Year);

            return ServiceResult<LeaveBalanceAdminDto>.Ok(
                _mapper.Map<LeaveBalanceAdminDto>(savedBalance),
                "Leave balance assigned successfully.");
        }

        public async Task<ServiceResult<LeaveBalanceAdminDto>> UpdateLeaveBalanceAsync(
            Guid balanceId, UpdateLeaveBalanceDto dto)
        {
            var balance = await _unitOfWork.LeaveBalances.GetByIdAsync(balanceId);
            if (balance is null)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Leave balance not found.");

            if (dto.TotalDays <= 0)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    "Total days must be greater than zero.");

            if (dto.TotalDays < balance.UsedDays)
                return ServiceResult<LeaveBalanceAdminDto>.Fail(
                    $"Cannot set total days ({dto.TotalDays}) below already " +
                    $"used days ({balance.UsedDays}).");

            balance.TotalDays = dto.TotalDays;
            balance.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.LeaveBalances.Update(balance);
            await _unitOfWork.SaveChangesAsync();

            // Reload with navigation properties for the response
            var updatedBalance = await _unitOfWork.LeaveBalances
                .GetByEmployeeAndTypeAsync(
                    balance.EmployeeId,
                    balance.LeaveTypeId,
                    balance.Year);

            return ServiceResult<LeaveBalanceAdminDto>.Ok(
                _mapper.Map<LeaveBalanceAdminDto>(updatedBalance),
                "Leave balance updated successfully.");
        }

        public async Task<ServiceResult<IEnumerable<LeaveBalanceAdminDto>>>
            GetEmployeeBalancesAsync(Guid employeeId, int year)
        {
            var employee = await _unitOfWork.Users.GetByIdAsync(employeeId);
            if (employee is null)
                return ServiceResult<IEnumerable<LeaveBalanceAdminDto>>.Fail(
                    "Employee not found.");

            var balances = await _unitOfWork.LeaveBalances
                .GetByEmployeeAsync(employeeId, year);

            var dtos = _mapper.Map<IEnumerable<LeaveBalanceAdminDto>>(balances);
            return ServiceResult<IEnumerable<LeaveBalanceAdminDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<IEnumerable<DepartmentDto>>> GetAllDepartmentsAsync()
        {
            var departments = await _unitOfWork.Departments.GetAllWithDetailsAsync();
            var dtos = _mapper.Map<IEnumerable<DepartmentDto>>(departments);
            return ServiceResult<IEnumerable<DepartmentDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<DepartmentDto>> CreateDepartmentAsync(
            CreateDepartmentDto dto)
        {
            var nameExists = await _unitOfWork.Departments.NameExistsAsync(dto.Name);
            if (nameExists)
                return ServiceResult<DepartmentDto>.Fail(
                    $"A department named '{dto.Name}' already exists.");

            if (dto.ManagerId.HasValue)
            {
                var manager = await _unitOfWork.Users.GetByIdAsync(dto.ManagerId.Value);
                if (manager is null)
                    return ServiceResult<DepartmentDto>.Fail(
                        "Specified manager not found.");
            }

            var department = new Department
            {
                Id = Guid.NewGuid(),
                Name = dto.Name.Trim(),
                ManagerId = dto.ManagerId,
                CreatedAt = DateTime.UtcNow,
            };

            await _unitOfWork.Departments.AddAsync(department);
            await _unitOfWork.SaveChangesAsync();

            // Reload with navigation properties
            var savedDepartment = await _unitOfWork.Departments
                .GetByIdAsync(department.Id);

            return ServiceResult<DepartmentDto>.Ok(
                _mapper.Map<DepartmentDto>(savedDepartment),
                "Department created successfully.");
        }

        public async Task<ServiceResult<DepartmentDto>> AssignManagerAsync(
            Guid departmentId, Guid managerId)
        {
            var department = await _unitOfWork.Departments.GetByIdAsync(departmentId);
            if (department is null)
                return ServiceResult<DepartmentDto>.Fail("Department not found.");

            var manager = await _unitOfWork.Users.GetByIdAsync(managerId);
            if (manager is null)
                return ServiceResult<DepartmentDto>.Fail("User not found.");

            department.ManagerId = managerId;
            department.UpdatedAt = DateTime.UtcNow;

            if (manager.DepartmentId != departmentId)
            {
                manager.DepartmentId = departmentId;
                manager.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Users.Update(manager);
            }

            _unitOfWork.Departments.Update(department);
            await _unitOfWork.SaveChangesAsync();

            // Reload with navigation properties
            var updatedDepartment = await _unitOfWork.Departments
                .GetAllWithDetailsAsync();
            var result = updatedDepartment.FirstOrDefault(d => d.Id == departmentId);

            return ServiceResult<DepartmentDto>.Ok(
                _mapper.Map<DepartmentDto>(result),
                "Manager assigned to department successfully.");
        }

        public async Task<ServiceResult<PagedResult<LeaveRequestDto>>> GetAllLeavesAsync(
    LeaveFilterParams filterParams)
        {
            var query = _unitOfWork.LeaveRequests.GetFilteredQuery(filterParams);

            var pagedEntities = await query.ToPagedResultAsync(
                filterParams.PageNumber, filterParams.PageSize);

            var dtoItems = _mapper.Map<IEnumerable<LeaveRequestDto>>(pagedEntities.Items);

            var result = new PagedResult<LeaveRequestDto>
            {
                Items = dtoItems,
                TotalCount = pagedEntities.TotalCount,
                PageNumber = pagedEntities.PageNumber,
                PageSize = pagedEntities.PageSize,
            };

            return ServiceResult<PagedResult<LeaveRequestDto>>.Ok(result);
        }

        public async Task<ServiceResult<PagedResult<EmployeeDto>>> GetAllEmployeesPagedAsync(
            EmployeeSearchParams searchParams)
        {
            var query = _unitOfWork.Users.GetEmployeesQuery(searchParams.Search);

            var pagedEntities = await query.ToPagedResultAsync(
                searchParams.PageNumber, searchParams.PageSize);

            var dtoItems = _mapper.Map<IEnumerable<EmployeeDto>>(pagedEntities.Items);

            var result = new PagedResult<EmployeeDto>
            {
                Items = dtoItems,
                TotalCount = pagedEntities.TotalCount,
                PageNumber = pagedEntities.PageNumber,
                PageSize = pagedEntities.PageSize,
            };

            return ServiceResult<PagedResult<EmployeeDto>>.Ok(result);
        }
    }
}