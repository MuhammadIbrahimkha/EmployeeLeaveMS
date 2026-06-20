using EmployeeLeaveMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeLeaveMS.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<LeaveType> LeaveTypes { get; set; }
        public DbSet<LeaveBalance> LeaveBalances { get; set; }
        public DbSet<LeaveRequest> LeaveRequests { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Fluent API Configuration

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);


            // Seed default leave types
            modelBuilder.Entity<LeaveType>().HasData(
                new LeaveType
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Name = "Annual",
                    DefaultDays = 15,
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new LeaveType
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "Sick",
                    DefaultDays = 10,
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new LeaveType
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Name = "Casual",
                    DefaultDays = 7,
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }

    }
}
