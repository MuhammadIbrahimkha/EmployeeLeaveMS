using EmployeeLeaveMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeLeaveMS.API.Controllers
{
    [ApiController]
    [Route("api/public")]
    public class PublicController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public PublicController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var result = await _adminService.GetAllDepartmentsAsync();
            return Ok(result);
        }
    }
}