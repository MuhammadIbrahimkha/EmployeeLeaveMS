using EmployeeLeaveMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeLeaveMS.Infrastructure.Data.Configurations
{
    public class LeaveBalanceConfiguration : IEntityTypeConfiguration<LeaveBalance>
    {
        public void Configure(EntityTypeBuilder<LeaveBalance> builder)
        {
            builder.HasOne(lb => lb.Employee)
                .WithMany(u => u.LeaveBalances)
                .HasForeignKey(lb => lb.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);


            builder.HasOne(lb => lb.LeaveType)
                .WithMany(lt => lt.LeaveBalances)
                .HasForeignKey(lb => lb.LeaveTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Ignore the computed property - not a database column

            builder.Ignore(lb => lb.RemainingDays);

            // Prevent duplicate balance rows for the same employee/type/year.
            // It says that: one employee can't have two 'Annual 2026'.
            builder.HasIndex(lb => new { lb.EmployeeId, lb.LeaveTypeId, lb.Year });
        }
    }
}
