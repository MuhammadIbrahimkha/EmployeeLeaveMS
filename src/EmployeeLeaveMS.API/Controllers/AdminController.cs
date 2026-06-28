using EmployeeLeaveMS.Application.DTOs.Admin;
using EmployeeLeaveMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeLeaveMS.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // ── Employee Management ────────────────────────────────────────────

        [HttpGet("employees")]
        public async Task<IActionResult> GetAllEmployees()
        {
            var result = await _adminService.GetAllEmployeesAsync();
            return Ok(result);
        }

        [HttpGet("employees/{id}")]
        public async Task<IActionResult> GetEmployee(Guid id)
        {
            var result = await _adminService.GetEmployeeByIdAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        // ── Leave Balance Management ───────────────────────────────────────

        [HttpPost("leave-balances")]
        public async Task<IActionResult> AssignBalance(
            [FromBody] AssignLeaveBalanceDto dto)
        {
            var result = await _adminService.AssignLeaveBalanceAsync(dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("leave-balances/{id}")]
        public async Task<IActionResult> UpdateBalance(
            Guid id, [FromBody] UpdateLeaveBalanceDto dto)
        {
            var result = await _adminService.UpdateLeaveBalanceAsync(id, dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("employees/{employeeId}/balances")]
        public async Task<IActionResult> GetEmployeeBalances(
            Guid employeeId, [FromQuery] int? year)
        {
            var targetYear = year ?? DateTime.UtcNow.Year;
            var result = await _adminService
                .GetEmployeeBalancesAsync(employeeId, targetYear);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        // ── Department Management ──────────────────────────────────────────

        [HttpGet("departments")]
        public async Task<IActionResult> GetAllDepartments()
        {
            var result = await _adminService.GetAllDepartmentsAsync();
            return Ok(result);
        }

        [HttpPost("departments")]
        public async Task<IActionResult> CreateDepartment(
            [FromBody] CreateDepartmentDto dto)
        {
            var result = await _adminService.CreateDepartmentAsync(dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("departments/{departmentId}/assign-manager/{managerId}")]
        public async Task<IActionResult> AssignManager(
            Guid departmentId, Guid managerId)
        {
            var result = await _adminService
                .AssignManagerAsync(departmentId, managerId);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}