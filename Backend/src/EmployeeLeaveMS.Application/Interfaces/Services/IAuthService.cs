using EmployeeLeaveMS.Application.DTOs;
using EmployeeLeaveMS.Application.DTOs.Auth;

namespace EmployeeLeaveMS.Application.Interfaces.Services
{
    public interface IAuthService
    {
        Task<ServiceResult<AuthResponseDto>> RegisterAsync(RegisterDto dto);
        Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto);
        Task<ServiceResult<AuthResponseDto>> RefreshTokenAsync(TokenRequestDto dto);

        Task<ServiceResult<bool>> LogoutAsync(string refreshToken);
    }
}
