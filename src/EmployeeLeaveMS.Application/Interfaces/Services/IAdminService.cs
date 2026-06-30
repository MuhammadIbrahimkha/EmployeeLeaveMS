using EmployeeLeaveMS.Application.DTOs;
using EmployeeLeaveMS.Application.DTOs.Admin;
using EmployeeLeaveMS.Application.DTOs.Common;
using EmployeeLeaveMS.Application.DTOs.Leave;

namespace EmployeeLeaveMS.Application.Interfaces.Services
{
    public interface IAdminService
    {
        // Employee management
        Task<ServiceResult<IEnumerable<EmployeeDto>>> GetAllEmployeesAsync();
        Task<ServiceResult<EmployeeDto>> GetEmployeeByIdAsync(Guid id);

        // Leave balance management
        Task<ServiceResult<LeaveBalanceAdminDto>> AssignLeaveBalanceAsync(AssignLeaveBalanceDto dto);
        Task<ServiceResult<LeaveBalanceAdminDto>> UpdateLeaveBalanceAsync(Guid balanceId, UpdateLeaveBalanceDto dto);
        Task<ServiceResult<IEnumerable<LeaveBalanceAdminDto>>> GetEmployeeBalancesAsync(Guid employeeId, int year);

        // Department management
        Task<ServiceResult<IEnumerable<DepartmentDto>>> GetAllDepartmentsAsync();
        Task<ServiceResult<DepartmentDto>> CreateDepartmentAsync(CreateDepartmentDto dto);
        Task<ServiceResult<DepartmentDto>> AssignManagerAsync(Guid departmentId, Guid managerId);

        Task<ServiceResult<PagedResult<LeaveRequestDto>>> GetAllLeavesAsync(
    LeaveFilterParams filterParams);

        Task<ServiceResult<PagedResult<EmployeeDto>>> GetAllEmployeesPagedAsync(
            EmployeeSearchParams searchParams);
    }
}