#!/bin/bash

# Helper script to run custom Linear scripts

# Check if a script name was provided
if [ -z "$1" ]; then
  echo "Usage: ./run_script.sh <script_name> [args]"
  echo "Available scripts:"
  ls -1 scripts/*.js | sed 's|scripts/||' | sed 's/\.js$//'
  exit 1
fi

# Get the script name and any additional arguments
SCRIPT_NAME=$1
shift
SCRIPT_ARGS=$@

# Check if the script exists
if [ ! -f "scripts/${SCRIPT_NAME}.js" ]; then
  echo "Error: Script 'scripts/${SCRIPT_NAME}.js' not found!"
  echo "Available scripts:"
  ls -1 scripts/*.js | sed 's|scripts/||' | sed 's/\.js$//'
  exit 1
fi

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  set -o allexport
  source .env
  set +o allexport
fi

# Check if LINEAR_API_KEY is set
if [ -z "$LINEAR_API_KEY" ]; then
  echo "Error: LINEAR_API_KEY environment variable is not set!"
  echo "Either set it in your environment or create a .env file."
  exit 1
fi

# Run the script
echo "Running scripts/${SCRIPT_NAME}.js..."
node "scripts/${SCRIPT_NAME}.js" $SCRIPT_ARGS 