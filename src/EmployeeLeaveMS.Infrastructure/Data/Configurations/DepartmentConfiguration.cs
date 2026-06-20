using EmployeeLeaveMS.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeLeaveMS.Infrastructure.Data.Configurations
{
    public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
    {
        public void Configure(EntityTypeBuilder<Department> builder)
        {
            // Department has one Manager (a User), one-way relationship
            builder.HasOne(d => d.Manager)
                   .WithMany()
                   .HasForeignKey(d => d.ManagerId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
