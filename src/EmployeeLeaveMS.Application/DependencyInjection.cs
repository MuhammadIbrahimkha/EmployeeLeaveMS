using EmployeeLeaveMS.Application.Interfaces.Services;
using EmployeeLeaveMS.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace EmployeeLeaveMS.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(
            this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ILeaveService, LeaveService>();
            services.AddScoped<ILeaveTypeService, LeaveTypeService>();
            services.AddScoped<IAdminService, AdminService>();
            return services;
        }
    }
}