using EmployeeLeaveMS.Application.DTOs.Common;
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

        IQueryable<LeaveRequest> GetFilteredQuery(LeaveFilterParams filterParams);
        IQueryable<LeaveRequest> GetByEmployeeQuery(Guid employeeId);
        IQueryable<LeaveRequest> GetPendingByManagerQuery(Guid managerId);
    }
}
