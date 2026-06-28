using EmployeeLeaveMS.Application.Interfaces;
using EmployeeLeaveMS.Application.Interfaces.Repositories;
using EmployeeLeaveMS.Domain.Entities;
using EmployeeLeaveMS.Infrastructure.Data;
using EmployeeLeaveMS.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EmployeeLeaveMS.Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext context;

        private IUserRepository? users;
        private ILeaveRequestRepository? leaveRequests;
        private ILeaveBalanceRepository? leaveBalances;
        private ILeaveTypeRepository? leaveTypes;
        private IDepartmentRepository? departments;
        private IRefreshTokenRepository? refreshTokens;
        


        public UnitOfWork(AppDbContext context)
        {
            this.context = context;
        }

        public IUserRepository Users =>
            users ??= new UserRepository(context);
        public ILeaveRequestRepository LeaveRequests =>
            leaveRequests ??= new LeaveRequestRepository(context);
        public ILeaveBalanceRepository LeaveBalances =>
            leaveBalances ??= new LeaveBalanceRepository(context);

        public ILeaveTypeRepository LeaveTypes =>
        leaveTypes ??= new LeaveTypeRepository(context);

        public IDepartmentRepository Departments =>
            departments ??= new DepartmentRepository(context);
        public IRefreshTokenRepository RefreshTokens =>
            refreshTokens ??= new RefreshTokenRepository(context);


        public async Task<int> SaveChangesAsync()
        {
            return await context.SaveChangesAsync();
        }

        public void Dispose()
        {
            context.Dispose();
        }

    }
}
