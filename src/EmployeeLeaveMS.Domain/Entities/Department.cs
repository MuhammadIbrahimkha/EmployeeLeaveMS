using EmployeeLeaveMS.Domain.Common;

namespace EmployeeLeaveMS.Domain.Entities
{
    public class Department : BaseEntity
    {
        public required string Name { get; set; }

        public Guid? ManagerId { get; set; }
        public User? Manager { get; set; }

        public ICollection<User> Employees { get; set; } = new List<User>();
    }
}
