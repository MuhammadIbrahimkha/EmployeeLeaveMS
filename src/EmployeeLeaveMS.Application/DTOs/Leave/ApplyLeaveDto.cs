namespace EmployeeLeaveMS.Application.DTOs.Leave
{
    public class ApplyLeaveDto
    {
        public Guid LeaveTypeId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public required string Reason { get; set; }
    }
}