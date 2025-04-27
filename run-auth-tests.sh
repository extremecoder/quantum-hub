#!/bin/bash

# Run the sign-out test
echo "Running sign-out test..."
node signout-test.js

# Exit with the status of the last command
exit $?
