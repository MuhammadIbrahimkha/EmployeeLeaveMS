using System.ComponentModel.DataAnnotations;

namespace EmployeeLeaveMS.Application.DTOs.Leave
{
    public class ApplyLeaveDto
    {
        [Required(ErrorMessage = "Leave type is required.")]
        public Guid LeaveTypeId { get; set; }

        [Required(ErrorMessage = "Start date is required.")]
        public DateOnly StartDate { get; set; }

        [Required(ErrorMessage = "End date is required.")]
        public DateOnly EndDate { get; set; }

        [Required(ErrorMessage = "Reason is required.")]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "Reason must be between 5 and 500 characters.")]
        public required string Reason { get; set; }
    }
}