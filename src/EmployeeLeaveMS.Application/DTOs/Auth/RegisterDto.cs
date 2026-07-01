using System.ComponentModel.DataAnnotations;

namespace EmployeeLeaveMS.Application.DTOs.Auth
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters.")]
        public required string FullName { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "A valid email address is required.")]
        public required string Email { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters.")]
        public required string Password { get; set; }

        [Required(ErrorMessage = "Department is required.")]
        public Guid DepartmentId { get; set; }
    }
}