namespace EmployeeLeaveMS.Application.DTOs.Auth
{
    public class RegisterDto
    {
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public Guid DepartmentId { get; set; }
    }
}
