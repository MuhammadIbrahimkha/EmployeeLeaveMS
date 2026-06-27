using EmployeeLeaveMS.Application.DTOs;
using EmployeeLeaveMS.Application.DTOs.Leave;
using EmployeeLeaveMS.Application.Helpers;
using EmployeeLeaveMS.Application.Interfaces;
using EmployeeLeaveMS.Application.Interfaces.Services;
using EmployeeLeaveMS.Domain.Entities;
using EmployeeLeaveMS.Domain.Enums;

namespace EmployeeLeaveMS.Application.Services
{
    public class LeaveService : ILeaveService
    {
        private readonly IUnitOfWork _unitOfWork;

        public LeaveService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ServiceResult<LeaveRequestDto>> ApplyAsync(
            Guid employeeId, ApplyLeaveDto dto)
        {
            // 1. Validate dates
            if (dto.EndDate < dto.StartDate)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "End date cannot be before start date.");

            if (dto.StartDate < DateOnly.FromDateTime(DateTime.UtcNow))
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Cannot apply for leave in the past.");

            // 2. Calculate working days
            var totalDays = DateHelper.CalculateWorkingDays(dto.StartDate, dto.EndDate);
            if (totalDays == 0)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Leave request must include at least one working day.");

            // 3. Check for overlapping leave
            var hasOverlap = await _unitOfWork.LeaveRequests
                .HasOverlappingLeaveAsync(employeeId, dto.StartDate, dto.EndDate);
            if (hasOverlap)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "You already have a leave request for overlapping dates.");

            // 4. Check leave balance
            var balance = await _unitOfWork.LeaveBalances
                .GetByEmployeeAndTypeAsync(
                    employeeId, dto.LeaveTypeId, DateTime.UtcNow.Year);

            if (balance is null)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "No leave balance found for this leave type. Contact HR.");

            if (balance.RemainingDays < totalDays)
                return ServiceResult<LeaveRequestDto>.Fail(
                    $"Insufficient leave balance. You have {balance.RemainingDays} " +
                    $"days remaining but requested {totalDays} days.");

            // 5. Create and save the leave request
            var leaveRequest = new LeaveRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = employeeId,
                LeaveTypeId = dto.LeaveTypeId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                TotalDays = totalDays,
                Reason = dto.Reason,
                Status = LeaveStatus.Pending,
                CreatedAt = DateTime.UtcNow,
            };

            await _unitOfWork.LeaveRequests.AddAsync(leaveRequest);
            await _unitOfWork.SaveChangesAsync();

            // 6. Return the result
            return ServiceResult<LeaveRequestDto>.Ok(
                MapToLeaveRequestDto(leaveRequest, null, null));
        }

        public async Task<ServiceResult<IEnumerable<LeaveRequestDto>>> GetMyLeavesAsync(
            Guid employeeId)
        {
            var leaves = await _unitOfWork.LeaveRequests
                .GetByEmployeeAsync(employeeId);

            var dtos = leaves.Select(lr => MapToLeaveRequestDto(
                lr,
                lr.LeaveType?.Name,
                lr.ReviewedBy?.FullName));

            return ServiceResult<IEnumerable<LeaveRequestDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<IEnumerable<LeaveBalanceDto>>> GetMyBalanceAsync(
            Guid employeeId)
        {
            var balances = await _unitOfWork.LeaveBalances
                .GetByEmployeeAsync(employeeId, DateTime.UtcNow.Year);

            var dtos = balances.Select(b => new LeaveBalanceDto
            {
                LeaveTypeId = b.LeaveTypeId,
                LeaveTypeName = b.LeaveType?.Name ?? string.Empty,
                TotalDays = b.TotalDays,
                UsedDays = b.UsedDays,
                RemainingDays = b.RemainingDays,
                Year = b.Year,
            });

            return ServiceResult<IEnumerable<LeaveBalanceDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<bool>> CancelAsync(
            Guid leaveRequestId, Guid employeeId)
        {
            // 1. Find the leave request
            var leaveRequest = await _unitOfWork.LeaveRequests
                .GetByIdAsync(leaveRequestId);

            if (leaveRequest is null)
                return ServiceResult<bool>.Fail("Leave request not found.");

            // 2. Verify it belongs to this employee
            if (leaveRequest.EmployeeId != employeeId)
                return ServiceResult<bool>.Fail(
                    "You can only cancel your own leave requests.");

            // 3. Only Pending requests can be cancelled
            if (leaveRequest.Status != LeaveStatus.Pending)
                return ServiceResult<bool>.Fail(
                    "Only pending leave requests can be cancelled.");

            // 4. Delete the request
            _unitOfWork.LeaveRequests.Delete(leaveRequest);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true, "Leave request cancelled successfully.");
        }

        public async Task<ServiceResult<IEnumerable<LeaveRequestDto>>> GetTeamRequestsAsync(
            Guid managerId)
        {
            var requests = await _unitOfWork.LeaveRequests
                .GetPendingByManagerAsync(managerId);

            var dtos = requests.Select(lr => MapToLeaveRequestDto(
                lr,
                lr.LeaveType?.Name,
                lr.ReviewedBy?.FullName));

            return ServiceResult<IEnumerable<LeaveRequestDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<LeaveRequestDto>> ApproveAsync(
            Guid leaveRequestId, Guid managerId, ApproveLeaveDto dto)
        {
            // 1. Find the leave request with employee data
            var leaveRequest = await _unitOfWork.LeaveRequests
                .GetByIdAsync(leaveRequestId);

            if (leaveRequest is null)
                return ServiceResult<LeaveRequestDto>.Fail("Leave request not found.");

            // 2. Must be Pending to approve
            if (leaveRequest.Status != LeaveStatus.Pending)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Only pending leave requests can be approved.");

            // 3. Find the employee to verify manager relationship
            var employee = await _unitOfWork.Users
                .GetByIdAsync(leaveRequest.EmployeeId);

            if (employee is null || employee.ManagerId != managerId)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "You can only approve requests from your direct reports.");

            // 4. Find and deduct the leave balance - the atomic operation
            var balance = await _unitOfWork.LeaveBalances
                .GetByEmployeeAndTypeAsync(
                    leaveRequest.EmployeeId,
                    leaveRequest.LeaveTypeId,
                    leaveRequest.StartDate.Year);

            if (balance is null)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Leave balance not found for this employee.");

            if (balance.RemainingDays < leaveRequest.TotalDays)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Employee has insufficient leave balance.");

            // 5. Update leave request status
            leaveRequest.Status = LeaveStatus.Approved;
            leaveRequest.ReviewedById = managerId;
            leaveRequest.ReviewComment = dto.ReviewComment;
            leaveRequest.ReviewedAt = DateTime.UtcNow;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            // 6. Deduct from balance
            balance.UsedDays += leaveRequest.TotalDays;
            balance.UpdatedAt = DateTime.UtcNow;

            // 7. Save BOTH changes atomically - this is exactly why UnitOfWork exists
            _unitOfWork.LeaveRequests.Update(leaveRequest);
            _unitOfWork.LeaveBalances.Update(balance);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<LeaveRequestDto>.Ok(
                MapToLeaveRequestDto(leaveRequest, null, null),
                "Leave request approved successfully.");
        }

        public async Task<ServiceResult<LeaveRequestDto>> RejectAsync(
            Guid leaveRequestId, Guid managerId, RejectLeaveDto dto)
        {
            // 1. Find the leave request
            var leaveRequest = await _unitOfWork.LeaveRequests
                .GetByIdAsync(leaveRequestId);

            if (leaveRequest is null)
                return ServiceResult<LeaveRequestDto>.Fail("Leave request not found.");

            // 2. Must be Pending to reject
            if (leaveRequest.Status != LeaveStatus.Pending)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Only pending leave requests can be rejected.");

            // 3. Verify manager relationship
            var employee = await _unitOfWork.Users
                .GetByIdAsync(leaveRequest.EmployeeId);

            if (employee is null || employee.ManagerId != managerId)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "You can only reject requests from your direct reports.");

            // 4. Update leave request - NO balance deduction on rejection
            leaveRequest.Status = LeaveStatus.Rejected;
            leaveRequest.ReviewedById = managerId;
            leaveRequest.ReviewComment = dto.ReviewComment;
            leaveRequest.ReviewedAt = DateTime.UtcNow;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.LeaveRequests.Update(leaveRequest);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<LeaveRequestDto>.Ok(
                MapToLeaveRequestDto(leaveRequest, null, null),
                "Leave request rejected.");
        }

        // ── Private helper ──────────────────────────────────────────────────
        private static LeaveRequestDto MapToLeaveRequestDto(
            LeaveRequest lr,
            string? leaveTypeName,
            string? reviewedByName)
        {
            return new LeaveRequestDto
            {
                Id = lr.Id,
                EmployeeName = lr.Employee?.FullName ?? string.Empty,
                LeaveTypeName = leaveTypeName ?? lr.LeaveType?.Name ?? string.Empty,
                StartDate = lr.StartDate,
                EndDate = lr.EndDate,
                TotalDays = lr.TotalDays,
                Reason = lr.Reason,
                Status = lr.Status.ToString(),
                ReviewedByName = reviewedByName ?? lr.ReviewedBy?.FullName,
                ReviewComment = lr.ReviewComment,
                ReviewedAt = lr.ReviewedAt,
                CreatedAt = lr.CreatedAt,
            };
        }
    }
}