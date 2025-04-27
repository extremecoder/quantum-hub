#!/bin/bash

# Set base URL for the Auth Service
AUTH_SERVICE_URL="http://localhost:8001/api/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    echo "Response: $2"
}

print_step() {
    echo -e "\n${YELLOW}Step $1: $2${NC}"
}

# Generate a unique identifier for this test run to avoid conflicts
TEST_ID=$(date +%s)
TEST_EMAIL="test${TEST_ID}@example.com"
TEST_USERNAME="testuser${TEST_ID}"
TEST_PASSWORD="SecurePassword123!"

# Store tokens and IDs
ACCESS_TOKEN=""
API_KEY_ID=""
API_KEY=""

# 1. Register a new user
print_step "1" "Registering a new user..."
REGISTER_RESPONSE=$(curl -s -X POST "${AUTH_SERVICE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"${TEST_EMAIL}"'",
    "username": "'"${TEST_USERNAME}"'",
    "password": "'"${TEST_PASSWORD}"'",
    "full_name": "Test User"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "access_token"; then
    print_success "User registered successfully"
    # Extract access token
    ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//g')
    echo "Access Token: ${ACCESS_TOKEN:0:10}...${ACCESS_TOKEN: -10}"
else
    print_error "Failed to register user" "$REGISTER_RESPONSE"
    exit 1
fi

# 2. Get user profile
print_step "2" "Getting user profile..."
PROFILE_RESPONSE=$(curl -s -X GET "${AUTH_SERVICE_URL}/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "$TEST_EMAIL"; then
    print_success "User profile retrieved successfully"
    echo "Email: $TEST_EMAIL"
    echo "Username: $TEST_USERNAME"
else
    print_error "Failed to get user profile" "$PROFILE_RESPONSE"
fi

# 3. Update user profile
print_step "3" "Updating user profile..."
UPDATE_PROFILE_RESPONSE=$(curl -s -X PUT "${AUTH_SERVICE_URL}/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated User",
    "is_provider": true
  }')

if echo "$UPDATE_PROFILE_RESPONSE" | grep -q "Updated"; then
    print_success "User profile updated successfully"
else
    print_error "Failed to update user profile" "$UPDATE_PROFILE_RESPONSE"
fi

# 4. Create API key
print_step "4" "Creating API key..."
CREATE_KEY_RESPONSE=$(curl -s -X POST "${AUTH_SERVICE_URL}/api-keys" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test API Key",
    "description": "API key for smoke testing"
  }')

if echo "$CREATE_KEY_RESPONSE" | grep -q "key"; then
    print_success "API key created successfully"
    # Extract API key and ID
    API_KEY=$(echo $CREATE_KEY_RESPONSE | grep -o '"key":"[^"]*' | sed 's/"key":"//g')
    API_KEY_ID=$(echo $CREATE_KEY_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//g')
    echo "API Key ID: $API_KEY_ID"
    echo "API Key: ${API_KEY:0:10}...${API_KEY: -10}"
else
    print_error "Failed to create API key" "$CREATE_KEY_RESPONSE"
fi

# 5. List API keys
print_step "5" "Listing API keys..."
LIST_KEYS_RESPONSE=$(curl -s -X GET "${AUTH_SERVICE_URL}/api-keys" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$LIST_KEYS_RESPONSE" | grep -q "Test API Key"; then
    print_success "API keys listed successfully"
else
    print_error "Failed to list API keys" "$LIST_KEYS_RESPONSE"
fi

# 6. Update API key
print_step "6" "Updating API key..."
UPDATE_KEY_RESPONSE=$(curl -s -X PUT "${AUTH_SERVICE_URL}/api-keys/${API_KEY_ID}" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test API Key",
    "description": "Updated API key for smoke testing"
  }')

if echo "$UPDATE_KEY_RESPONSE" | grep -q "Updated Test API Key"; then
    print_success "API key updated successfully"
else
    print_error "Failed to update API key" "$UPDATE_KEY_RESPONSE"
fi

# 7. Logout (invalidate token)
print_step "7" "Logging out..."
# Note: This is a simulated logout since we're not storing the token server-side
# In a real implementation, you would have a logout endpoint that invalidates the token
print_success "Logged out successfully (simulated)"

# 8. Login again
print_step "8" "Logging in again..."
LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_SERVICE_URL}/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${TEST_USERNAME}&password=${TEST_PASSWORD}")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    print_success "Logged in successfully"
    # Extract new access token
    NEW_ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//g')
    echo "New Access Token: ${NEW_ACCESS_TOKEN:0:10}...${NEW_ACCESS_TOKEN: -10}"
    ACCESS_TOKEN=$NEW_ACCESS_TOKEN
else
    print_error "Failed to login" "$LOGIN_RESPONSE"
fi

# 9. Delete API key
print_step "9" "Deleting API key..."
DELETE_KEY_RESPONSE=$(curl -s -X DELETE "${AUTH_SERVICE_URL}/api-keys/${API_KEY_ID}" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if [ -z "$DELETE_KEY_RESPONSE" ] || echo "$DELETE_KEY_RESPONSE" | grep -q "success"; then
    print_success "API key deleted successfully"
else
    print_error "Failed to delete API key" "$DELETE_KEY_RESPONSE"
fi

# 10. Verify API key is deleted
print_step "10" "Verifying API key deletion..."
VERIFY_DELETE_RESPONSE=$(curl -s -X GET "${AUTH_SERVICE_URL}/api-keys" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$VERIFY_DELETE_RESPONSE" | grep -q "$API_KEY_ID"; then
    print_error "API key still exists after deletion" "$VERIFY_DELETE_RESPONSE"
else
    print_success "API key deletion verified"
fi

echo -e "\n${GREEN}Smoke test completed!${NC}"
