namespace EmployeeLeaveMS.Domain.Exceptions
{
    public class ValidationException : BaseException
    {
        public List<string> Errors { get; }

        public ValidationException(string message)
            : base(message, 400)
        {
            Errors = new List<string> { message };
        }

        public ValidationException(List<string> errors)
            : base("One or more validation errors occurred.", 400)
        {
            Errors = errors;
        }
    }
}