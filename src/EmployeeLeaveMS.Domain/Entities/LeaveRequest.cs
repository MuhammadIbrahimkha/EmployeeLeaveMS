using EmployeeLeaveMS.Domain.Common;
using EmployeeLeaveMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeLeaveMS.Domain.Entities
{
    public class LeaveRequest : BaseEntity
    {
        public Guid EmployeeId { get; set; }
        public User? Employee { get; set; }

        public Guid LeaveTypeId { get; set; }
        public LeaveType? LeaveType { get; set; }

        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int TotalDays { get; set; }
        public required string Reason { get; set; }

        public LeaveStatus Status { get; set; } = LeaveStatus.Pending;

        // Filled in only when Manager makes a decision
        public Guid? ReviewedById { get; set; }
        public User? ReviewedBy { get; set; }
        public string? ReviewComment { get; set; }
        public DateTime? ReviewedAt { get; set; }
    }
}
