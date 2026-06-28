using EmployeeLeaveMS.Application.Interfaces.Repositories;

namespace EmployeeLeaveMS.Application.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }

        ILeaveRequestRepository LeaveRequests { get; }

        ILeaveBalanceRepository LeaveBalances { get; }
        ILeaveTypeRepository LeaveTypes { get; }
        IDepartmentRepository Departments { get; }
        IRefreshTokenRepository RefreshTokens { get; }

        Task<int> SaveChangesAsync();
    }
}
