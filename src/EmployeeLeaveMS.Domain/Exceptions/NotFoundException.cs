namespace EmployeeLeaveMS.Domain.Exceptions
{
    public class NotFoundException : BaseException
    {
        public NotFoundException(string message)
            : base(message, 404)
        {
        }

        public NotFoundException(string entityName, Guid id)
            : base($"{entityName} with Id '{id}' was not found.", 404)
        {
        }
    }
}