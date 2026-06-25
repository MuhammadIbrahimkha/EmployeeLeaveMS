using EmployeeLeaveMS.Application.Interfaces;
using EmployeeLeaveMS.Application.Interfaces.Services;
using EmployeeLeaveMS.Infrastructure.Data;
using EmployeeLeaveMS.Infrastructure.Helpers;
using EmployeeLeaveMS.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EmployeeLeaveMS.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Register AppDbContext
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("EmployeeLeaveBD")));

            // Register UnitOfWork - this gives access to all repositories
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            services.AddScoped<IJwtHelper, JwtHelper>();
            services.AddScoped<IPasswordHasher, PasswordHasher>();
            return services;
        }
    }
}