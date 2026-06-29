using AutoMapper;
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
        private readonly IMapper _mapper;

        public LeaveService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResult<LeaveRequestDto>> ApplyAsync(
            Guid employeeId, ApplyLeaveDto dto)
        {
            if (dto.EndDate < dto.StartDate)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "End date cannot be before start date.");

            if (dto.StartDate < DateOnly.FromDateTime(DateTime.UtcNow))
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Cannot apply for leave in the past.");

            var totalDays = DateHelper.CalculateWorkingDays(dto.StartDate, dto.EndDate);
            if (totalDays == 0)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Leave request must include at least one working day.");

            var hasOverlap = await _unitOfWork.LeaveRequests
                .HasOverlappingLeaveAsync(employeeId, dto.StartDate, dto.EndDate);
            if (hasOverlap)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "You already have a leave request for overlapping dates.");

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


            // Reload with all navigation properties
            var saved = await _unitOfWork.LeaveRequests
                .GetByEmployeeAsync(leaveRequest.EmployeeId);
            var result = saved.FirstOrDefault(lr => lr.Id == leaveRequest.Id);

            return ServiceResult<LeaveRequestDto>.Ok(
                _mapper.Map<LeaveRequestDto>(result));
        }

        public async Task<ServiceResult<IEnumerable<LeaveRequestDto>>> GetMyLeavesAsync(
            Guid employeeId)
        {
            var leaves = await _unitOfWork.LeaveRequests
                .GetByEmployeeAsync(employeeId);

            var dtos = _mapper.Map<IEnumerable<LeaveRequestDto>>(leaves);
            return ServiceResult<IEnumerable<LeaveRequestDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<IEnumerable<LeaveBalanceDto>>> GetMyBalanceAsync(
            Guid employeeId)
        {
            var balances = await _unitOfWork.LeaveBalances
                .GetByEmployeeAsync(employeeId, DateTime.UtcNow.Year);

            var dtos = _mapper.Map<IEnumerable<LeaveBalanceDto>>(balances);
            return ServiceResult<IEnumerable<LeaveBalanceDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<bool>> CancelAsync(
            Guid leaveRequestId, Guid employeeId)
        {
            var leaveRequest = await _unitOfWork.LeaveRequests
                .GetByIdAsync(leaveRequestId);

            if (leaveRequest is null)
                return ServiceResult<bool>.Fail("Leave request not found.");

            if (leaveRequest.EmployeeId != employeeId)
                return ServiceResult<bool>.Fail(
                    "You can only cancel your own leave requests.");

            if (leaveRequest.Status != LeaveStatus.Pending)
                return ServiceResult<bool>.Fail(
                    "Only pending leave requests can be cancelled.");

            _unitOfWork.LeaveRequests.Delete(leaveRequest);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true,
                "Leave request cancelled successfully.");
        }

        public async Task<ServiceResult<IEnumerable<LeaveRequestDto>>> GetTeamRequestsAsync(
            Guid managerId)
        {
            var requests = await _unitOfWork.LeaveRequests
                .GetPendingByManagerAsync(managerId);

            var dtos = _mapper.Map<IEnumerable<LeaveRequestDto>>(requests);
            return ServiceResult<IEnumerable<LeaveRequestDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<LeaveRequestDto>> ApproveAsync(
            Guid leaveRequestId, Guid managerId, ApproveLeaveDto dto)
        {
            var leaveRequest = await _unitOfWork.LeaveRequests
                .GetByIdAsync(leaveRequestId);

            if (leaveRequest is null)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Leave request not found.");

            if (leaveRequest.Status != LeaveStatus.Pending)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Only pending leave requests can be approved.");

            var employee = await _unitOfWork.Users
                .GetByIdAsync(leaveRequest.EmployeeId);

            if (employee is null || employee.ManagerId != managerId)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "You can only approve requests from your direct reports.");

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

            leaveRequest.Status = LeaveStatus.Approved;
            leaveRequest.ReviewedById = managerId;
            leaveRequest.ReviewComment = dto.ReviewComment;
            leaveRequest.ReviewedAt = DateTime.UtcNow;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            balance.UsedDays += leaveRequest.TotalDays;
            balance.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.LeaveRequests.Update(leaveRequest);
            _unitOfWork.LeaveBalances.Update(balance);
            await _unitOfWork.SaveChangesAsync();

            // Reload with navigation properties
            var updated = await _unitOfWork.LeaveRequests
                .GetByEmployeeAsync(leaveRequest.EmployeeId);
            var result = updated.FirstOrDefault(lr => lr.Id == leaveRequestId);

            return ServiceResult<LeaveRequestDto>.Ok(
                _mapper.Map<LeaveRequestDto>(result),
                "Leave request approved successfully.");
        }

        public async Task<ServiceResult<LeaveRequestDto>> RejectAsync(
            Guid leaveRequestId, Guid managerId, RejectLeaveDto dto)
        {
            var leaveRequest = await _unitOfWork.LeaveRequests
                .GetByIdAsync(leaveRequestId);

            if (leaveRequest is null)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Leave request not found.");

            if (leaveRequest.Status != LeaveStatus.Pending)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "Only pending leave requests can be rejected.");

            var employee = await _unitOfWork.Users
                .GetByIdAsync(leaveRequest.EmployeeId);

            if (employee is null || employee.ManagerId != managerId)
                return ServiceResult<LeaveRequestDto>.Fail(
                    "You can only reject requests from your direct reports.");

            leaveRequest.Status = LeaveStatus.Rejected;
            leaveRequest.ReviewedById = managerId;
            leaveRequest.ReviewComment = dto.ReviewComment;
            leaveRequest.ReviewedAt = DateTime.UtcNow;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.LeaveRequests.Update(leaveRequest);
            await _unitOfWork.SaveChangesAsync();

            // Reload with navigation properties
            var updated = await _unitOfWork.LeaveRequests
                .GetByEmployeeAsync(leaveRequest.EmployeeId);
            var result = updated.FirstOrDefault(lr => lr.Id == leaveRequestId);

            return ServiceResult<LeaveRequestDto>.Ok(
                _mapper.Map<LeaveRequestDto>(result),
                "Leave request rejected.");
        }
    }
}