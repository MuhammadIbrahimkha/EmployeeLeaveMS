using EmployeeLeaveMS.Application.DTOs;
using EmployeeLeaveMS.Application.DTOs.Admin;
using EmployeeLeaveMS.Application.Interfaces;
using EmployeeLeaveMS.Application.Interfaces.Services;
using EmployeeLeaveMS.Domain.Entities;

namespace EmployeeLeaveMS.Application.Services
{
    public class LeaveTypeService : ILeaveTypeService
    {
        private readonly IUnitOfWork _unitOfWork;

        public LeaveTypeService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ServiceResult<IEnumerable<LeaveTypeDto>>> GetAllActiveAsync()
        {
            var leaveTypes = await _unitOfWork.LeaveTypes.GetAllActiveAsync();

            var dtos = leaveTypes.Select(lt => MapToDto(lt));

            return ServiceResult<IEnumerable<LeaveTypeDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<LeaveTypeDto>> GetByIdAsync(Guid id)
        {
            var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(id);

            if (leaveType is null)
                return ServiceResult<LeaveTypeDto>.Fail(
                    "Leave type not found.");

            return ServiceResult<LeaveTypeDto>.Ok(MapToDto(leaveType));
        }

        public async Task<ServiceResult<LeaveTypeDto>> CreateAsync(CreateLeaveTypeDto dto)
        {
            // 1. Validate name is unique
            var nameExists = await _unitOfWork.LeaveTypes.NameExistsAsync(dto.Name);
            if (nameExists)
                return ServiceResult<LeaveTypeDto>.Fail(
                    $"A leave type with the name '{dto.Name}' already exists.");

            // 2. Validate default days
            if (dto.DefaultDays <= 0)
                return ServiceResult<LeaveTypeDto>.Fail(
                    "Default days must be greater than zero.");

            // 3. Create entity
            var leaveType = new LeaveType
            {
                Id = Guid.NewGuid(),
                Name = dto.Name.Trim(),
                DefaultDays = dto.DefaultDays,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };

            await _unitOfWork.LeaveTypes.AddAsync(leaveType);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<LeaveTypeDto>.Ok(
                MapToDto(leaveType), "Leave type created successfully.");
        }

        public async Task<ServiceResult<LeaveTypeDto>> UpdateAsync(
            Guid id, UpdateLeaveTypeDto dto)
        {
            // 1. Find the leave type
            var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(id);
            if (leaveType is null)
                return ServiceResult<LeaveTypeDto>.Fail("Leave type not found.");

            // 2. Check if deactivated
            if (!leaveType.IsActive)
                return ServiceResult<LeaveTypeDto>.Fail(
                    "Cannot update a deactivated leave type.");

            // 3. Update name if provided and different
            if (!string.IsNullOrWhiteSpace(dto.Name) &&
                dto.Name.Trim() != leaveType.Name)
            {
                var nameExists = await _unitOfWork.LeaveTypes
                    .NameExistsAsync(dto.Name.Trim());
                if (nameExists)
                    return ServiceResult<LeaveTypeDto>.Fail(
                        $"A leave type with the name '{dto.Name}' already exists.");

                leaveType.Name = dto.Name.Trim();
            }

            // 4. Update default days if provided
            if (dto.DefaultDays.HasValue)
            {
                if (dto.DefaultDays.Value <= 0)
                    return ServiceResult<LeaveTypeDto>.Fail(
                        "Default days must be greater than zero.");

                leaveType.DefaultDays = dto.DefaultDays.Value;
            }

            leaveType.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.LeaveTypes.Update(leaveType);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<LeaveTypeDto>.Ok(
                MapToDto(leaveType), "Leave type updated successfully.");
        }

        public async Task<ServiceResult<bool>> DeactivateAsync(Guid id)
        {
            // 1. Find the leave type
            var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(id);
            if (leaveType is null)
                return ServiceResult<bool>.Fail("Leave type not found.");

            // 2. Already deactivated
            if (!leaveType.IsActive)
                return ServiceResult<bool>.Fail(
                    "Leave type is already deactivated.");

            // 3. Soft delete
            leaveType.IsActive = false;
            leaveType.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.LeaveTypes.Update(leaveType);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true,
                "Leave type deactivated successfully.");
        }

        private static LeaveTypeDto MapToDto(LeaveType lt) => new()
        {
            Id = lt.Id,
            Name = lt.Name,
            DefaultDays = lt.DefaultDays,
            IsActive = lt.IsActive,
            CreatedAt = lt.CreatedAt,
        };
    }
}