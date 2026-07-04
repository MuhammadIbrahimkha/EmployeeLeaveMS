using EmployeeLeaveMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmployeeLeaveMS.Domain.Entities
{
    public class LeaveBalance : BaseEntity
    {
        public Guid EmployeeId { get; set; }
        public User? Employee { get; set; }

        public Guid LeaveTypeId { get; set; }
        public LeaveType? LeaveType { get; set; }

        public int TotalDays { get; set; }
        public int UsedDays { get; set; }
        public int Year { get; set; }


        // Computed, not stored - calculated on the fly
        public int RemainingDays => TotalDays - UsedDays;
    }
}
