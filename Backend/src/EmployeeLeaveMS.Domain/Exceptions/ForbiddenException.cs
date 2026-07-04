namespace EmployeeLeaveMS.Domain.Exceptions
{
    public class ForbiddenException : BaseException
    {
        public ForbiddenException(string message = "You do not have permission to access this resource.")
            : base(message, 403)
        {
        }
    }
}