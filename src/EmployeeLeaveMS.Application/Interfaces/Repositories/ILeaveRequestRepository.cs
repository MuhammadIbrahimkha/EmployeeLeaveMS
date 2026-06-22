using EmployeeLeaveMS.Domain.Entities;
using EmployeeLeaveMS.Domain.Enums;

namespace EmployeeLeaveMS.Application.Interfaces.Repositories
{
    public  interface ILeaveRequestRepository : IGenericRepository<LeaveRequest>
    {
        Task<IEnumerable<LeaveRequest>> GetByEmployeeAsync(Guid employeeId);
        Task<IEnumerable<LeaveRequest>> GetPendingByManagerAsync(Guid managerId);

        Task<IEnumerable<LeaveRequest>> GetByStatusAsync(LeaveStatus status);

        Task<bool> HasOverlappingLeaveAsync(Guid employeeId, DateOnly startDate, DateOnly endDate);
    }
}
