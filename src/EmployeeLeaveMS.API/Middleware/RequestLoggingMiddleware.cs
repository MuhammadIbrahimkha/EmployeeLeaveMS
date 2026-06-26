using Serilog.Context;

namespace EmployeeLeaveMS.API.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(
            RequestDelegate next,
            ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var requestId = Guid.NewGuid().ToString();
            var userId = context.User?.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "Anonymous";

            using (LogContext.PushProperty("RequestId", requestId))
            using (LogContext.PushProperty("UserId", userId))
            {
                _logger.LogInformation(
                    "Request started: {Method} {Path}",
                    context.Request.Method,
                    context.Request.Path);

                await _next(context);

                _logger.LogInformation(
                    "Request completed: {Method} {Path} {StatusCode}",
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode);
            }
        }
    }
}