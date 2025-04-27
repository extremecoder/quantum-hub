# Authentication Flow Tests

This directory contains test scripts for verifying the authentication flow in the Quantum Hub application.

## Sign-out Test

The `signout-test.js` script tests the sign-out functionality to ensure that:

1. Users can successfully sign in
2. The session is properly established
3. Users can sign out
4. After signing out, users cannot access protected pages
5. After signing out, the session is properly terminated

### Running the Test

To run the sign-out test:

```bash
node signout-test.js
```

### Test Steps

The test performs the following steps:

1. **Sign in**: Signs in with a test user
2. **Check session state**: Verifies that the session is properly established
3. **Sign out**: Clicks the sign-out button
4. **Verify sign out**: Checks that the session is properly terminated
5. **Try to access protected page**: Verifies that the user cannot access protected pages after signing out

### Expected Results

- After signing in, the user should be redirected to the dashboard
- After signing out, the session token should be removed from cookies
- After signing out, localStorage should be cleared of authentication-related items
- After signing out, trying to access the dashboard should redirect to the sign-in page

## Troubleshooting

If the test fails, check the following:

1. Make sure the frontend and backend services are running
2. Check that the test user exists in the database
3. Verify that the sign-out functionality is properly implemented in the frontend
4. Check the browser console for any errors

## Adding New Tests

When adding new authentication tests, follow these guidelines:

1. Create a new test script with a descriptive name
2. Document the test steps and expected results
3. Use Puppeteer for browser automation
4. Add error handling and logging
5. Take screenshots at key points for debugging
