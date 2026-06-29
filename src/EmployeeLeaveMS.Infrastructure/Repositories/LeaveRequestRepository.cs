using EmployeeLeaveMS.Application.Interfaces.Repositories;
using EmployeeLeaveMS.Domain.Entities;
using EmployeeLeaveMS.Domain.Enums;
using EmployeeLeaveMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeLeaveMS.Infrastructure.Repositories
{
    public class LeaveRequestRepository : GenericRepository<LeaveRequest>,ILeaveRequestRepository
    {
        public LeaveRequestRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<LeaveRequest>> GetByEmployeeAsync(Guid employeeId)
        {
            return await _dbSet
                .Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.ReviewedBy)
                .Where(lr => lr.EmployeeId == employeeId)
                .OrderByDescending(lr => lr.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<LeaveRequest>> GetPendingByManagerAsync(Guid managerId)
        {
            return await _dbSet
                .Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .Where(lr => lr.Employee.ManagerId == managerId
                          && lr.Status == LeaveStatus.Pending)
                .OrderBy(lr => lr.CreatedAt)
                .ToListAsync();

        }

        public async Task<IEnumerable<LeaveRequest>> GetByStatusAsync(LeaveStatus status)
        {
            return await _dbSet
                 .Include(lr => lr.Employee)
                 .Include(lr => lr.LeaveType)
                 .Where(lr => lr.Status == status)
                 .OrderByDescending(lr => lr.CreatedAt)
                 .ToListAsync();
        }

        public async Task<bool> HasOverlappingLeaveAsync(
           Guid employeeId, DateOnly startDate, DateOnly endDate)
        {
            return await _dbSet
                .AnyAsync(lr =>
                    lr.EmployeeId == employeeId &&
                    (lr.Status == LeaveStatus.Pending ||
                     lr.Status == LeaveStatus.Approved) &&
                    lr.StartDate <= endDate &&
                    lr.EndDate >= startDate);
        }
    }
}
