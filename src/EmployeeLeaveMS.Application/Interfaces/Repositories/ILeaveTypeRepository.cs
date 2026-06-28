using EmployeeLeaveMS.Domain.Entities;

namespace EmployeeLeaveMS.Application.Interfaces.Repositories
{
    public interface ILeaveTypeRepository : IGenericRepository<LeaveType>
    {
        Task<IEnumerable<LeaveType>> GetAllActiveAsync();
        Task<bool> NameExistsAsync(string name);
    }
}