namespace EmployeeLeaveMS.Application.DTOs.Admin
{
    public class AssignLeaveBalanceDto
    {
        public Guid EmployeeId { get; set; }
        public Guid LeaveTypeId { get; set; }
        public int TotalDays { get; set; }
        public int Year { get; set; }
    }
}