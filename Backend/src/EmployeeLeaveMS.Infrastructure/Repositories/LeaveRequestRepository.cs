using EmployeeLeaveMS.Application.DTOs.Common;
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

        public IQueryable<LeaveRequest> GetFilteredQuery(LeaveFilterParams filterParams)
        {
            var query = _dbSet
                .Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.ReviewedBy)
                .AsQueryable();

            if (filterParams.Status.HasValue)
                query = query.Where(lr => lr.Status == filterParams.Status.Value);

            if (filterParams.LeaveTypeId.HasValue)
                query = query.Where(lr => lr.LeaveTypeId == filterParams.LeaveTypeId.Value);

            if (filterParams.StartDate.HasValue)
                query = query.Where(lr => lr.StartDate >= filterParams.StartDate.Value);

            if (filterParams.EndDate.HasValue)
                query = query.Where(lr => lr.EndDate <= filterParams.EndDate.Value);

            return query.OrderByDescending(lr => lr.CreatedAt);
        }

        public IQueryable<LeaveRequest> GetByEmployeeQuery(Guid employeeId)
        {
            return _dbSet
                .Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.ReviewedBy)
                .Where(lr => lr.EmployeeId == employeeId)
                .OrderByDescending(lr => lr.CreatedAt);
        }

        public IQueryable<LeaveRequest> GetPendingByManagerQuery(Guid managerId)
        {
            return _dbSet
                .Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .Where(lr => lr.Employee.ManagerId == managerId
                          && lr.Status == LeaveStatus.Pending)
                .OrderBy(lr => lr.CreatedAt);
        }
    }
}
