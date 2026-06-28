namespace EmployeeLeaveMS.Application.DTOs.Admin
{
    public class CreateLeaveTypeDto
    {
        public required string Name { get; set; }
        public int DefaultDays { get; set; }
    }
}