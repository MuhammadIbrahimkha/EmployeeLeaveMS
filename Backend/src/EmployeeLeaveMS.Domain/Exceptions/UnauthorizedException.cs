namespace EmployeeLeaveMS.Domain.Exceptions
{
    public class UnauthorizedException : BaseException
    {
        public UnauthorizedException(string message = "You are not authorized to perform this action.")
            : base(message, 401)
        {
        }
    }
}