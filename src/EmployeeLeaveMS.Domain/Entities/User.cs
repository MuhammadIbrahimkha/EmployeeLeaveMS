using EmployeeLeaveMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeLeaveMS.Domain.Entities
{
    public class User : BaseEntity
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; } = true;

        // which department this user belongs to
        public Guid DepartmentId { get; set; }
        public Department? Department { get; set; }

        // who this user reports to (nullable - CEO has no manager )

        public Guid? ManagerId { get; set; }
        public User? Manager { get; set; }

        // Reverse side - employees who report to this user (if they're a manager)
        public ICollection<User> DirectReports { get; set; } = new List<User>();

        // This user's leave requests
        public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();

        // This user's leave balances
        public ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();
    }
}
