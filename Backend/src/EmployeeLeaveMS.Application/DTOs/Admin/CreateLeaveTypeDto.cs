using System.ComponentModel.DataAnnotations;

namespace EmployeeLeaveMS.Application.DTOs.Admin
{
    public class CreateLeaveTypeDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 50 characters.")]
        public required string Name { get; set; }

        [Range(1, 365, ErrorMessage = "Default days must be between 1 and 365.")]
        public int DefaultDays { get; set; }
    }
}