using EmployeeLeaveMS.Application.Interfaces.Repositories;
using EmployeeLeaveMS.Domain.Entities;
using EmployeeLeaveMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeLeaveMS.Infrastructure.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<IEnumerable<User>> GetByDepartmentAsync(Guid departmentId)
        {
            return await _dbSet
                .Where(u => u.DepartmentId == departmentId && u.IsActive)
                .ToListAsync();
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _dbSet
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }
    }
}
