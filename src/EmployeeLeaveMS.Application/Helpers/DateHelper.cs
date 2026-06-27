namespace EmployeeLeaveMS.Application.Helpers
{
    public static class DateHelper
    {
        public static int CalculateWorkingDays(DateOnly startDate, DateOnly endDate)
        {
            if (endDate < startDate)
                return 0;

            int workingDays = 0;
            var current = startDate;

            while (current <= endDate)
            {
                if (current.DayOfWeek != DayOfWeek.Saturday &&
                    current.DayOfWeek != DayOfWeek.Sunday)
                {
                    workingDays++;
                }
                current = current.AddDays(1);
            }

            return workingDays;
        }
    }
}