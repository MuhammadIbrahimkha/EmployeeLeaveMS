using EmployeeLeaveMS.Domain.Entities;

namespace EmployeeLeaveMS.Application.Interfaces.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetByDepartmentAsync(Guid departmentId);
        Task<bool> EmailExistsAsync(string email);
    }
}
