using EmployeeLeaveMS.Application.Interfaces.Repositories;

namespace EmployeeLeaveMS.Application.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }

        ILeaveRequestRepository LeaveRequests { get; }

        ILeaveBalanceRepository LeaveBalances { get; }
        IRefreshTokenRepository RefreshTokens { get; }

        Task<int> SaveChangesAsync();
    }
}
