namespace EmployeeLeaveMS.Application.DTOs.Admin
{
    public class CreateDepartmentDto
    {
        public required string Name { get; set; }
        public Guid? ManagerId { get; set; }
    }
}