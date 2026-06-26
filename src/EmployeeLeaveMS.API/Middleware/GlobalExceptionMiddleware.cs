using System.Net;
using System.Text.Json;
using EmployeeLeaveMS.API.Models;
using EmployeeLeaveMS.Domain.Exceptions;

namespace EmployeeLeaveMS.API.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning("Not found: {Message}", ex.Message);
                await WriteErrorResponse(context, ex.StatusCode, ex.Message, new List<string>());
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning("Validation failed: {Message}", ex.Message);
                await WriteErrorResponse(context, ex.StatusCode, ex.Message, ex.Errors);
            }
            catch (UnauthorizedException ex)
            {
                _logger.LogWarning("Unauthorized: {Message}", ex.Message);
                await WriteErrorResponse(context, ex.StatusCode, ex.Message, new List<string>());
            }
            catch (ForbiddenException ex)
            {
                _logger.LogWarning("Forbidden: {Message}", ex.Message);
                await WriteErrorResponse(context, ex.StatusCode, ex.Message, new List<string>());
            }
            catch (ConflictException ex)
            {
                _logger.LogWarning("Conflict: {Message}", ex.Message);
                await WriteErrorResponse(context, ex.StatusCode, ex.Message, new List<string>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred: {Message}", ex.Message);
                await WriteErrorResponse(
                    context,
                    (int)HttpStatusCode.InternalServerError,
                    "An unexpected error occurred. Please try again later.",
                    new List<string>());
            }
        }

        private static async Task WriteErrorResponse(
            HttpContext context,
            int statusCode,
            string message,
            List<string> errors)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var response = new ErrorResponse
            {
                StatusCode = statusCode,
                Message = message,
                Errors = errors
            };

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
        }
    }
}