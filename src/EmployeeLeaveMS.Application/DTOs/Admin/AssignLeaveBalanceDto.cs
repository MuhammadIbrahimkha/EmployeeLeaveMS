using System.ComponentModel.DataAnnotations;

namespace EmployeeLeaveMS.Application.DTOs.Admin
{
    public class AssignLeaveBalanceDto
    {
        [Required(ErrorMessage = "Employee is required.")]
        public Guid EmployeeId { get; set; }

        [Required(ErrorMessage = "Leave type is required.")]
        public Guid LeaveTypeId { get; set; }

        [Range(1, 365, ErrorMessage = "Total days must be between 1 and 365.")]
        public int TotalDays { get; set; }

        [Range(2020, 2100, ErrorMessage = "Year must be a valid year.")]
        public int Year { get; set; }
    }
}