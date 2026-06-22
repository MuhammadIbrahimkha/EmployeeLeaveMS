using EmployeeLeaveMS.Domain.Entities;

namespace EmployeeLeaveMS.Application.Interfaces.Repositories
{
    public interface ILeaveBalanceRepository : IGenericRepository<LeaveBalance>
    {
        Task<LeaveBalance?> GetByEmployeeAndTypeAsync(Guid employeeId, Guid leaveTypeId, int year);
        Task<IEnumerable<LeaveBalance>> GetByEmployeeAsync(Guid employeeId, int year);
    }

}
