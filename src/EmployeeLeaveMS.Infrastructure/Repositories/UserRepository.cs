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

        public async Task<IEnumerable<User>> GetAllEmployeesAsync()
        {
            return await _dbSet
                .Include(u => u.Department)
                .Include(u => u.Manager)
                .Where(u => u.IsActive)
                .OrderBy(u => u.FullName)
                .ToListAsync();
        }

        public async Task<User?> GetByIdWithDetailsAsync(Guid id)
        {
            return await _dbSet
                .Include(u => u.Department)
                .Include(u => u.Manager)
                .FirstOrDefaultAsync(u => u.Id == id);
        }
        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _dbSet
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public IQueryable<User> GetEmployeesQuery(string? search)
        {
            var query = _dbSet
                .Include(u => u.Department)
                .Include(u => u.Manager)
                .Where(u => u.IsActive)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(lowerSearch) ||
                    u.Email.ToLower().Contains(lowerSearch));
            }

            return query.OrderBy(u => u.FullName);
        }
    }
}
