using System.ComponentModel.DataAnnotations;

namespace EmployeeLeaveMS.Application.DTOs.Leave
{
    public class RejectLeaveDto
    {
        [Required(ErrorMessage = "A review comment is required when rejecting a leave request.")]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "Comment must be between 5 and 500 characters.")]
        public required string ReviewComment { get; set; }
    }
}