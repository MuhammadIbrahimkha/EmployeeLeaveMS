namespace EmployeeLeaveMS.Application.DTOs.Admin
{
    public class EmployeeDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string? ManagerName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}