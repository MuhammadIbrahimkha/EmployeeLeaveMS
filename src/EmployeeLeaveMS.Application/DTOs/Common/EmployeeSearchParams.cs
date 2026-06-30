namespace EmployeeLeaveMS.Application.DTOs.Common
{
    public class EmployeeSearchParams : PaginationParams
    {
        public string? Search { get; set; }
    }
}