using EmployeeLeaveMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeLeaveMS.Domain.Entities
{
    public class LeaveType : BaseEntity
    {
        public required string Name { get; set; }
        public int DefaultDays { get; set; }
        public bool IsActive { get; set; } = true;

        // A leave type can be used in many balances and many requests
        public ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();

        public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();


    }
}
