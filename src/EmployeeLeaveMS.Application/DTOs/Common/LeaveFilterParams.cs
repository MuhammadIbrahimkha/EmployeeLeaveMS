using EmployeeLeaveMS.Domain.Enums;

namespace EmployeeLeaveMS.Application.DTOs.Common
{
    public class LeaveFilterParams : PaginationParams
    {
        public LeaveStatus? Status { get; set; }
        public Guid? LeaveTypeId { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }
}