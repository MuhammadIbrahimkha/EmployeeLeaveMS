using EmployeeLeaveMS.Application.Interfaces.Repositories;
using EmployeeLeaveMS.Domain.Entities;
using EmployeeLeaveMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeLeaveMS.Infrastructure.Repositories
{
    public class DepartmentRepository : GenericRepository<Department>, IDepartmentRepository
    {
        public DepartmentRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Department>> GetAllWithDetailsAsync()
        {
            return await _dbSet
                .Include(d => d.Manager)
                .Include(d => d.Employees.Where(e => e.IsActive))
                .OrderBy(d => d.Name)
                .ToListAsync();
        }

        public async Task<bool> NameExistsAsync(string name)
        {
            return await _dbSet
                .AnyAsync(d => d.Name.ToLower() == name.ToLower());
        }
    }
}