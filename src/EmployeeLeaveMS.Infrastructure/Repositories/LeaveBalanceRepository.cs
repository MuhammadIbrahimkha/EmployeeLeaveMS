using EmployeeLeaveMS.Application.Interfaces.Repositories;
using EmployeeLeaveMS.Domain.Entities;
using EmployeeLeaveMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeLeaveMS.Infrastructure.Repositories
{
    public class LeaveBalanceRepository : GenericRepository<LeaveBalance>, ILeaveBalanceRepository
    {
        public LeaveBalanceRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<LeaveBalance?> GetByEmployeeAndTypeAsync(
            Guid employeeId, Guid leaveTypeId, int year)
        {
            return await _dbSet
                .FirstOrDefaultAsync(lb =>
                    lb.EmployeeId == employeeId &&
                    lb.LeaveTypeId == leaveTypeId &&
                    lb.Year == year);
        }

        public async Task<IEnumerable<LeaveBalance>> GetByEmployeeAsync(
            Guid employeeId, int year)
        {
            return await _dbSet
                .Include(lb => lb.LeaveType)
                .Where(lb => lb.EmployeeId == employeeId && lb.Year == year)
                .ToListAsync();
        }
    }
}