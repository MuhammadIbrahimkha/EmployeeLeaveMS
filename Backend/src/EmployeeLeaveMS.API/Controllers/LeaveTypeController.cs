using EmployeeLeaveMS.Application.DTOs.Admin;
using EmployeeLeaveMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeLeaveMS.API.Controllers
{
    [ApiController]
    [Route("api/leave-types")]
    [Authorize]
    public class LeaveTypeController : ControllerBase
    {
        private readonly ILeaveTypeService _leaveTypeService;

        public LeaveTypeController(ILeaveTypeService leaveTypeService)
        {
            _leaveTypeService = leaveTypeService;
        }

        // Available to all authenticated users
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _leaveTypeService.GetAllActiveAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _leaveTypeService.GetByIdAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        // Admin only - write operations
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateLeaveTypeDto dto)
        {
            var result = await _leaveTypeService.CreateAsync(dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateLeaveTypeDto dto)
        {
            var result = await _leaveTypeService.UpdateAsync(id, dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            var result = await _leaveTypeService.DeactivateAsync(id);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}