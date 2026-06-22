using EmployeeLeaveMS.Domain.Entities;

namespace EmployeeLeaveMS.Application.Interfaces.Repositories
{
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task RevokeAllUserTokensAsync(Guid userId);
    }
}
