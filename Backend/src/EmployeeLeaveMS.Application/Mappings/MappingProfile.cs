using AutoMapper;
using EmployeeLeaveMS.Application.DTOs.Admin;
using EmployeeLeaveMS.Application.DTOs.Auth;
using EmployeeLeaveMS.Application.DTOs.Leave;
using EmployeeLeaveMS.Domain.Entities;

namespace EmployeeLeaveMS.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ── Auth ──────────────────────────────────────────────────────
            CreateMap<User, AuthResponseDto>()
                .ForMember(dest => dest.Role,
                           opt => opt.MapFrom(src => src.Role.ToString()))
                .ForMember(dest => dest.AccessToken,
                           opt => opt.Ignore())
                .ForMember(dest => dest.RefreshToken,
                           opt => opt.Ignore())
                .ForMember(dest => dest.AccessTokenExpiry,
                           opt => opt.Ignore());

            // ── Leave Types ───────────────────────────────────────────────
            CreateMap<LeaveType, LeaveTypeDto>();

            // ── Leave Requests ────────────────────────────────────────────
            CreateMap<LeaveRequest, LeaveRequestDto>()
     .ForMember(dest => dest.EmployeeName,
         opt => opt.MapFrom(src =>
             src.Employee != null ? src.Employee.FullName : string.Empty))
     .ForMember(dest => dest.LeaveTypeName,
         opt => opt.MapFrom(src =>
             src.LeaveType != null ? src.LeaveType.Name : string.Empty))
     .ForMember(dest => dest.Status,
         opt => opt.MapFrom(src => src.Status.ToString()))
     .ForMember(dest => dest.ReviewedByName,
         opt => opt.MapFrom(src =>
             src.ReviewedBy != null ? src.ReviewedBy.FullName : null))
     .ForMember(dest => dest.EmployeeRole,
         opt => opt.MapFrom(src =>
             src.Employee != null ? src.Employee.Role.ToString() : string.Empty));
            // ── Leave Balances (Employee view) ────────────────────────────
            CreateMap<LeaveBalance, LeaveBalanceDto>()
                .ForMember(dest => dest.LeaveTypeName,
                           opt => opt.MapFrom(src =>
                               src.LeaveType != null
                                   ? src.LeaveType.Name
                                   : string.Empty))
                .ForMember(dest => dest.RemainingDays,
                           opt => opt.MapFrom(src => src.RemainingDays));

            // ── Leave Balances (Admin view) ───────────────────────────────
            CreateMap<LeaveBalance, LeaveBalanceAdminDto>()
                .ForMember(dest => dest.EmployeeName,
                           opt => opt.MapFrom(src =>
                               src.Employee != null
                                   ? src.Employee.FullName
                                   : string.Empty))
                .ForMember(dest => dest.LeaveTypeName,
                           opt => opt.MapFrom(src =>
                               src.LeaveType != null
                                   ? src.LeaveType.Name
                                   : string.Empty))
                .ForMember(dest => dest.RemainingDays,
                           opt => opt.MapFrom(src => src.RemainingDays));

            // ── Users / Employees ─────────────────────────────────────────
            CreateMap<User, EmployeeDto>()
                .ForMember(dest => dest.Role,
                           opt => opt.MapFrom(src => src.Role.ToString()))
                .ForMember(dest => dest.DepartmentName,
                           opt => opt.MapFrom(src =>
                               src.Department != null
                                   ? src.Department.Name
                                   : string.Empty))
                .ForMember(dest => dest.ManagerName,
                           opt => opt.MapFrom(src =>
                               src.Manager != null
                                   ? src.Manager.FullName
                                   : null));

            // ── Departments ───────────────────────────────────────────────
            CreateMap<Department, DepartmentDto>()
                .ForMember(dest => dest.ManagerName,
                           opt => opt.MapFrom(src =>
                               src.Manager != null
                                   ? src.Manager.FullName
                                   : null))
                .ForMember(dest => dest.EmployeeCount,
                           opt => opt.MapFrom(src =>
                               src.Employees != null
                                   ? src.Employees.Count(e => e.IsActive)
                                   : 0));
        }
    }
}