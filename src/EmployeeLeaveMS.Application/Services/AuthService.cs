using EmployeeLeaveMS.Application.DTOs;
using EmployeeLeaveMS.Application.DTOs.Auth;
using EmployeeLeaveMS.Application.Interfaces;
using EmployeeLeaveMS.Application.Interfaces.Services;
using EmployeeLeaveMS.Domain.Entities;
using EmployeeLeaveMS.Domain.Enums;

namespace EmployeeLeaveMS.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IJwtHelper _jwtHelper;
        private readonly IPasswordHasher passwordHasher;

        public AuthService(IUnitOfWork unitOfWork, IJwtHelper jwtHelper, IPasswordHasher passwordHasher)
        {
            _unitOfWork = unitOfWork;
            _jwtHelper = jwtHelper;
            this.passwordHasher = passwordHasher;
        }

        public async Task<ServiceResult<AuthResponseDto>> RegisterAsync(RegisterDto dto)
        {
            // 1. Check if email already exists
            var emailExists = await _unitOfWork.Users.EmailExistsAsync(dto.Email);
            if (emailExists)
                return ServiceResult<AuthResponseDto>.Fail("Email is already registered.");

            // 2. Hash the password
            var passwordHash = passwordHasher.Hash(dto.Password);

            // 3. Create the user entity
            var user = new User
            {
                Id = Guid.NewGuid(),
                FullName = dto.FullName,
                Email = dto.Email.ToLower(),
                PasswordHash = passwordHash,
                Role = UserRole.Employee,
                DepartmentId = dto.DepartmentId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };

            // 4. Generate tokens
            var accessToken = _jwtHelper.GenerateAccessToken(user);
            var refreshToken = _jwtHelper.GenerateRefreshToken();
            var tokenExpiry = _jwtHelper.GetAccessTokenExpiry();

            // 5. Create refresh token entity
            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
                CreatedAt = DateTime.UtcNow,
            };

            // 6. Save both in one atomic commit
            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.RefreshTokens.AddAsync(refreshTokenEntity);
            await _unitOfWork.SaveChangesAsync();

            // 7. Return the response
            return ServiceResult<AuthResponseDto>.Ok(new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                AccessTokenExpiry = tokenExpiry,
            });
        }

        public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginDto dto)
        {
            // 1. Find user by email
            var user = await _unitOfWork.Users.GetByEmailAsync(dto.Email);
            if (user is null)
                return ServiceResult<AuthResponseDto>.Fail("Invalid credentials.");

            // 2. Check if account is active
            if (!user.IsActive)
                return ServiceResult<AuthResponseDto>.Fail("Account is deactivated.");

            // 3. Verify password
            var passwordValid = passwordHasher.Verify(dto.Password, user.PasswordHash);
            if (!passwordValid)
                return ServiceResult<AuthResponseDto>.Fail("Invalid credentials.");

            // 4. Revoke all existing refresh tokens for this user
            await _unitOfWork.RefreshTokens.RevokeAllUserTokensAsync(user.Id);

            // 5. Generate fresh tokens
            var accessToken = _jwtHelper.GenerateAccessToken(user);
            var refreshToken = _jwtHelper.GenerateRefreshToken();
            var tokenExpiry = _jwtHelper.GetAccessTokenExpiry();

            // 6. Save new refresh token
            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
                CreatedAt = DateTime.UtcNow,
            };

            await _unitOfWork.RefreshTokens.AddAsync(refreshTokenEntity);
            await _unitOfWork.SaveChangesAsync();

            // 7. Return the response
            return ServiceResult<AuthResponseDto>.Ok(new AuthResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                AccessTokenExpiry = tokenExpiry,
            });
        }

        public async Task<ServiceResult<AuthResponseDto>> RefreshTokenAsync(TokenRequestDto dto)
        {
            // 1. Find the refresh token in database
            var refreshToken = await _unitOfWork.RefreshTokens
                .GetByTokenAsync(dto.RefreshToken);

            if (refreshToken is null)
                return ServiceResult<AuthResponseDto>.Fail("Invalid refresh token.");

            // 2. Check if token is still active
            if (!refreshToken.IsActive)
                return ServiceResult<AuthResponseDto>.Fail("Refresh token has expired or been revoked.");

            // 3. Revoke the old refresh token - token rotation
            refreshToken.IsRevoked = true;
            refreshToken.UpdatedAt = DateTime.UtcNow;

            // 4. Generate new tokens
            var newAccessToken = _jwtHelper.GenerateAccessToken(refreshToken.User!);
            var newRefreshToken = _jwtHelper.GenerateRefreshToken();
            var tokenExpiry = _jwtHelper.GetAccessTokenExpiry();

            // 5. Save new refresh token
            var newRefreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = refreshToken.UserId,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
                CreatedAt = DateTime.UtcNow,
            };

            await _unitOfWork.RefreshTokens.AddAsync(newRefreshTokenEntity);
            await _unitOfWork.SaveChangesAsync();

            // 6. Return new tokens
            return ServiceResult<AuthResponseDto>.Ok(new AuthResponseDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                FullName = refreshToken.User!.FullName,
                Email = refreshToken.User!.Email,
                Role = refreshToken.User!.Role.ToString(),
                AccessTokenExpiry = tokenExpiry,
            });
        }

        public async Task<ServiceResult<bool>> LogoutAsync(string refreshToken)
        {
            // 1. Find the token
            var token = await _unitOfWork.RefreshTokens.GetByTokenAsync(refreshToken);

            if (token is null || !token.IsActive)
                return ServiceResult<bool>.Fail("Invalid or already expired token.");

            // 2. Revoke it
            token.IsRevoked = true;
            token.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true, "Logged out successfully.");
        }
    }
}