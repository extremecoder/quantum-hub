# Variable for the ALB DNS name passed from GitHub Actions
variable "alb_dns_name" {
  description = "The DNS name of the Application Load Balancer"
  type        = string
  # No default value, as it must be provided externally
}

# Data source to look up the existing API Gateway
data "aws_apigatewayv2_api" "existing_quantum_api" {
  # Find the API Gateway created by the microservice project
  # Make sure this name exactly matches the existing API Gateway name
  name = "quantum-microservice-http-api"
}

# Task 7: API Gateway integration with ALB (HTTP)
# This integration will be associated with the existing API Gateway looked up above
resource "aws_apigatewayv2_integration" "quantum_alb_integration" {
  api_id             = data.aws_apigatewayv2_api.existing_quantum_api.id # Use ID from data source
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${var.alb_dns_name}:80/{proxy}" # Use port 80 for ALB listener
  payload_format_version = "1.0"
}

# Task 8: Define specific routes on the existing API Gateway

# Route for backend API calls (/api/*)
resource "aws_apigatewayv2_route" "backend_api_route" {
  api_id    = data.aws_apigatewayv2_api.existing_quantum_api.id # Use ID from data source
  route_key = "ANY /api/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.quantum_alb_integration.id}"
}

# Route for frontend calls (everything else)
# Note: This replaces the single default route possibly created by the other project
resource "aws_apigatewayv2_route" "frontend_route" {
  api_id    = data.aws_apigatewayv2_api.existing_quantum_api.id # Use ID from data source
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.quantum_alb_integration.id}"
}

# Note: We are not managing the Stage or Logging here, assuming the other project does or it's managed manually.
# If this project should manage them, uncomment and adjust the blocks below, potentially using data sources.

# # Log group for API Gateway Access Logs (Example using data source if managed elsewhere)
# data "aws_cloudwatch_log_group" "existing_api_logs" {
#   name = "/aws/api-gateway/${data.aws_apigatewayv2_api.existing_quantum_api.name}"
# }

# # API Gateway default stage (Example using data source if managed elsewhere)
# data "aws_apigatewayv2_stage" "existing_default_stage" {
#   api_id = data.aws_apigatewayv2_api.existing_quantum_api.id
#   name   = "$default"
# }


# Task 10: Output the API Gateway invoke URL
output "api_gateway_invoke_url" {
  description = "The invoke URL for the existing API Gateway stage"
  value       = data.aws_apigatewayv2_api.existing_quantum_api.api_endpoint # Use endpoint from data source
} 