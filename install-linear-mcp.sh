#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing Agency Linear MCP Server...${NC}"

# Step 1: Install the package globally
echo -e "📦 Installing agency-linear package globally..."
npm install -g agency-linear

# Step 2: Check if installation was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ agency-linear package installed successfully!${NC}"
else
  echo -e "❌ Failed to install agency-linear package. Please check your npm configuration."
  exit 1
fi

# Step 3: Set up Cursor MCP configuration
CURSOR_CONFIG_DIR="$HOME/.cursor"
MCP_CONFIG_FILE="$CURSOR_CONFIG_DIR/mcp.json"

# Check if the directory exists, if not create it
mkdir -p "$CURSOR_CONFIG_DIR"

# Ask for Linear API key
echo -e "${YELLOW}Please enter your Linear API key:${NC}"
read -s LINEAR_API_KEY
echo ""

if [ -z "$LINEAR_API_KEY" ]; then
  echo -e "❌ API key cannot be empty. Please run the script again."
  exit 1
fi

# Check if mcp.json exists
if [ -f "$MCP_CONFIG_FILE" ]; then
  # Back up the existing file
  cp "$MCP_CONFIG_FILE" "$MCP_CONFIG_FILE.backup"
  echo -e "📁 Backed up existing MCP configuration."
  
  # Check if the file is valid JSON
  if jq empty "$MCP_CONFIG_FILE" 2>/dev/null; then
    # Update the existing configuration
    # First, check if agency-linear is already configured
    if jq -e '.mcpServers["agency-linear"]' "$MCP_CONFIG_FILE" >/dev/null 2>&1; then
      # Update only the API key
      jq --arg key "$LINEAR_API_KEY" '.mcpServers["agency-linear"].env.LINEAR_API_KEY = $key' "$MCP_CONFIG_FILE" > "$MCP_CONFIG_FILE.tmp"
      mv "$MCP_CONFIG_FILE.tmp" "$MCP_CONFIG_FILE"
      echo -e "${GREEN}✅ Updated agency-linear configuration in Cursor MCP settings.${NC}"
    else
      # Add agency-linear configuration
      jq --arg key "$LINEAR_API_KEY" '.mcpServers["agency-linear"] = {"command": "npx", "args": ["agency-linear"], "env": {"LINEAR_API_KEY": $key}, "disabled": false, "alwaysAllow": []}' "$MCP_CONFIG_FILE" > "$MCP_CONFIG_FILE.tmp"
      mv "$MCP_CONFIG_FILE.tmp" "$MCP_CONFIG_FILE"
      echo -e "${GREEN}✅ Added agency-linear to Cursor MCP settings.${NC}"
    fi
  else
    # If not valid JSON, create a new file with basic config
    echo "{\"mcpServers\": {\"agency-linear\": {\"command\": \"npx\", \"args\": [\"agency-linear\"], \"env\": {\"LINEAR_API_KEY\": \"$LINEAR_API_KEY\"}, \"disabled\": false, \"alwaysAllow\": []}}}" > "$MCP_CONFIG_FILE"
    echo -e "${GREEN}✅ Created new Cursor MCP configuration with agency-linear.${NC}"
  fi
else
  # Create a new configuration file
  echo "{\"mcpServers\": {\"agency-linear\": {\"command\": \"npx\", \"args\": [\"agency-linear\"], \"env\": {\"LINEAR_API_KEY\": \"$LINEAR_API_KEY\"}, \"disabled\": false, \"alwaysAllow\": []}}}" > "$MCP_CONFIG_FILE"
  echo -e "${GREEN}✅ Created Cursor MCP configuration with agency-linear.${NC}"
fi

echo -e "\n${GREEN}✅ Installation complete!${NC}"
echo -e "You can now use the Linear MCP server in Cursor with the tool name 'agency-linear'."
echo -e "If Cursor is currently running, please restart it for the changes to take effect." 