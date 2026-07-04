using EmployeeLeaveMS.Application.DTOs;
using EmployeeLeaveMS.Application.DTOs.Common;
using EmployeeLeaveMS.Application.DTOs.Leave;

namespace EmployeeLeaveMS.Application.Interfaces.Services
{
    public interface ILeaveService
    {
        // Employee operations
        Task<ServiceResult<LeaveRequestDto>> ApplyAsync(Guid employeeId, ApplyLeaveDto dto);
        Task<ServiceResult<IEnumerable<LeaveRequestDto>>> GetMyLeavesAsync(Guid employeeId);
        Task<ServiceResult<IEnumerable<LeaveBalanceDto>>> GetMyBalanceAsync(Guid employeeId);
        Task<ServiceResult<bool>> CancelAsync(Guid leaveRequestId, Guid employeeId);

        // Manager operations
        Task<ServiceResult<IEnumerable<LeaveRequestDto>>> GetTeamRequestsAsync(Guid managerId);
        Task<ServiceResult<LeaveRequestDto>> ApproveAsync(Guid leaveRequestId, Guid managerId, ApproveLeaveDto dto);
        Task<ServiceResult<LeaveRequestDto>> RejectAsync(Guid leaveRequestId, Guid managerId, RejectLeaveDto dto);

        Task<ServiceResult<PagedResult<LeaveRequestDto>>> GetMyLeavesPagedAsync(
         Guid employeeId, PaginationParams paginationParams);

        Task<ServiceResult<PagedResult<LeaveRequestDto>>> GetTeamRequestsPagedAsync(
            Guid managerId, PaginationParams paginationParams);


    }
}