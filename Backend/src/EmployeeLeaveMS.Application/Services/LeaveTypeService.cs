using AutoMapper;
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
        private readonly IMapper _mapper;

        public LeaveTypeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceResult<IEnumerable<LeaveTypeDto>>> GetAllActiveAsync()
        {
            var leaveTypes = await _unitOfWork.LeaveTypes.GetAllActiveAsync();
            var dtos = _mapper.Map<IEnumerable<LeaveTypeDto>>(leaveTypes);
            return ServiceResult<IEnumerable<LeaveTypeDto>>.Ok(dtos);
        }

        public async Task<ServiceResult<LeaveTypeDto>> GetByIdAsync(Guid id)
        {
            var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(id);
            if (leaveType is null)
                return ServiceResult<LeaveTypeDto>.Fail("Leave type not found.");

            return ServiceResult<LeaveTypeDto>.Ok(
                _mapper.Map<LeaveTypeDto>(leaveType));
        }

        public async Task<ServiceResult<LeaveTypeDto>> CreateAsync(CreateLeaveTypeDto dto)
        {
            var nameExists = await _unitOfWork.LeaveTypes.NameExistsAsync(dto.Name);
            if (nameExists)
                return ServiceResult<LeaveTypeDto>.Fail(
                    $"A leave type with the name '{dto.Name}' already exists.");

            if (dto.DefaultDays <= 0)
                return ServiceResult<LeaveTypeDto>.Fail(
                    "Default days must be greater than zero.");

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
                _mapper.Map<LeaveTypeDto>(leaveType),
                "Leave type created successfully.");
        }

        public async Task<ServiceResult<LeaveTypeDto>> UpdateAsync(
            Guid id, UpdateLeaveTypeDto dto)
        {
            var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(id);
            if (leaveType is null)
                return ServiceResult<LeaveTypeDto>.Fail("Leave type not found.");

            if (!leaveType.IsActive)
                return ServiceResult<LeaveTypeDto>.Fail(
                    "Cannot update a deactivated leave type.");

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
                _mapper.Map<LeaveTypeDto>(leaveType),
                "Leave type updated successfully.");
        }

        public async Task<ServiceResult<bool>> DeactivateAsync(Guid id)
        {
            var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(id);
            if (leaveType is null)
                return ServiceResult<bool>.Fail("Leave type not found.");

            if (!leaveType.IsActive)
                return ServiceResult<bool>.Fail(
                    "Leave type is already deactivated.");

            leaveType.IsActive = false;
            leaveType.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.LeaveTypes.Update(leaveType);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true,
                "Leave type deactivated successfully.");
        }
    }
}