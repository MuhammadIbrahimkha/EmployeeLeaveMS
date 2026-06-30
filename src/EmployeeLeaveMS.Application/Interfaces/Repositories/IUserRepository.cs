using EmployeeLeaveMS.Domain.Entities;

namespace EmployeeLeaveMS.Application.Interfaces.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetByDepartmentAsync(Guid departmentId);

        Task<IEnumerable<User>> GetAllEmployeesAsync();

        Task<User?> GetByIdWithDetailsAsync(Guid id);

        Task<bool> EmailExistsAsync(string email);

        IQueryable<User> GetEmployeesQuery(string? search);
    }
}
