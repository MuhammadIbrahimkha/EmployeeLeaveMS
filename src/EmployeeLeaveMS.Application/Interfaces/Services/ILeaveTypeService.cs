using EmployeeLeaveMS.Application.DTOs;
using EmployeeLeaveMS.Application.DTOs.Admin;

namespace EmployeeLeaveMS.Application.Interfaces.Services
{
    public interface ILeaveTypeService
    {
        Task<ServiceResult<IEnumerable<LeaveTypeDto>>> GetAllActiveAsync();
        Task<ServiceResult<LeaveTypeDto>> GetByIdAsync(Guid id);
        Task<ServiceResult<LeaveTypeDto>> CreateAsync(CreateLeaveTypeDto dto);
        Task<ServiceResult<LeaveTypeDto>> UpdateAsync(Guid id, UpdateLeaveTypeDto dto);
        Task<ServiceResult<bool>> DeactivateAsync(Guid id);
    }
}