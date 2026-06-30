using EmployeeLeaveMS.Application.DTOs.Common;
using EmployeeLeaveMS.Application.DTOs.Leave;
using EmployeeLeaveMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeLeaveMS.API.Controllers
{
    [ApiController]
    [Route("api/leaves")]
    [Authorize]
    public class LeaveController : ControllerBase
    {
        private readonly ILeaveService _leaveService;
        private readonly ICurrentUserService _currentUser;

        public LeaveController(
            ILeaveService leaveService,
            ICurrentUserService currentUser)
        {
            _leaveService = leaveService;
            _currentUser = currentUser;
        }

        // ── Employee Endpoints ─────────────────────────────────────────────

        [HttpPost("apply")]
        [Authorize(Roles = "Employee,Manager,Admin")]
        public async Task<IActionResult> Apply([FromBody] ApplyLeaveDto dto)
        {
            var result = await _leaveService.ApplyAsync(_currentUser.UserId, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpGet("my-leaves")]
        public async Task<IActionResult> GetMyLeaves([FromQuery] PaginationParams paginationParams)
        {
            var result = await _leaveService
                .GetMyLeavesPagedAsync(_currentUser.UserId, paginationParams);
            return Ok(result);
        }

        [HttpGet("my-balance")]
        public async Task<IActionResult> GetMyBalance()
        {
            var result = await _leaveService.GetMyBalanceAsync(_currentUser.UserId);
            return Ok(result);
        }

        [HttpDelete("{id}/cancel")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            var result = await _leaveService.CancelAsync(id, _currentUser.UserId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ── Manager Endpoints ──────────────────────────────────────────────

        [HttpGet("team-requests")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> GetTeamRequests([FromQuery] PaginationParams paginationParams)
        {
            var result = await _leaveService
                .GetTeamRequestsPagedAsync(_currentUser.UserId, paginationParams);
            return Ok(result);
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveLeaveDto dto)
        {
            var result = await _leaveService
                .ApproveAsync(id, _currentUser.UserId, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Reject(Guid id, [FromBody] RejectLeaveDto dto)
        {
            var result = await _leaveService
                .RejectAsync(id, _currentUser.UserId, dto);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}