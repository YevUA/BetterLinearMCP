#!/bin/bash

# Get the Linear API key from environment variable or prompt for it
API_KEY=${LINEAR_API_KEY:-""}

if [ -z "$API_KEY" ]; then
  echo "LINEAR_API_KEY environment variable not set"
  echo "Please set it before running this script:"
  echo "LINEAR_API_KEY=your_api_key ./run.sh"
  exit 1
fi

# Start the server using Node.js
node build/index.js