# ... (variable "alb_dns_name" and aws_apigatewayv2_api "quantum_api" remain the same) ...

# Task 7: API Gateway integration with ALB (HTTP) - Remains largely the same
resource "aws_apigatewayv2_integration" "quantum_alb_integration" {
  api_id             = aws_apigatewayv2_api.quantum_api.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  # The integration URI includes {proxy} which passes the path to the ALB
  # The ALB's Ingress rules will handle routing based on this path
  integration_uri    = "http://${var.alb_dns_name}:80/{proxy}" # Use port 80 for ALB listener
  payload_format_version = "1.0"

  # Optional: Add timeout if needed, default is 30 seconds
  # timeout_milliseconds = 29000
}

# Task 8: Define specific routes

# Route for backend API calls (/api/*)
resource "aws_apigatewayv2_route" "backend_api_route" {
  api_id    = aws_apigatewayv2_api.quantum_api.id
  # Capture anything after /api/ and forward it
  route_key = "ANY /api/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.quantum_alb_integration.id}"
}

# Route for frontend calls (everything else - /, /static/*, /_next/*, etc.)
# This acts as the default route because its path is less specific than /api/
resource "aws_apigatewayv2_route" "frontend_route" {
  api_id    = aws_apigatewayv2_api.quantum_api.id
  # Capture the root and any path not matching /api/
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.quantum_alb_integration.id}"
}

# Note: The previous single default route "ANY /{proxy+}" is now replaced
# by the more specific /api/{proxy+} route and the new default /{proxy+} route.

# ... (aws_cloudwatch_log_group and aws_apigatewayv2_stage "default_stage" remain the same) ...

# Task 10: Output the API Gateway invoke URL - Remains the same
output "api_gateway_invoke_url" {
  description = "The invoke URL for the API Gateway stage"
  value       = aws_apigatewayv2_api.quantum_api.api_endpoint
} 