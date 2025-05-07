# BetterLinearMCP

A Model Context Protocol (MCP) server that provides tools for interacting with Linear's API, enabling AI agents to manage issues, projects, and teams programmatically through the Linear platform.

## Features

- **Issue Management**
  - Create new issues with customizable properties (title, description, team, assignee, priority, labels, project)
  - List issues with flexible filtering options (team, assignee, status)
  - Update existing issues (title, description, status, assignee, priority, project)
  - Search issues based on text queries
  - Get detailed issue information including comments, labels, and metadata
  - Create and update comments on issues

- **Team Management**
  - List all teams in the workspace
  - Create new teams with custom properties
  - Update existing teams
  - Delete or archive teams
  - Access team details including ID, name, key, and description

- **Project Management**
  - List all projects with optional team filtering
  - Create new projects with customizable properties
  - Update existing projects
  - View project details including teams, state, and metadata
  - Manage project milestones (create, list, update, delete)

- **User Management**
  - List all users in the workspace
  - Get detailed user information

- **Label Management**
  - List all labels with optional team filtering
  - Create new labels
  - Update existing labels
  - Delete labels

## Installation & Setup

### Prerequisites
- Node.js 18 or later
- A Linear account with an API key ([get one here](https://linear.app/settings/api))
- Cursor, Claude, or other MCP-compatible AI assistant

### Quick Installation (Recommended)

The easiest way to install and configure BetterLinearMCP:

```bash
# For Mac/Linux:
npx agency-linear cursor-setup

# For Windows:
npx agency-linear cursor-setup
```

This interactive setup will:
1. Guide you through entering your Linear API key
2. Automatically configure Cursor's MCP settings
3. Set up everything you need to use the Linear tools

### Alternative Installation Methods

#### Global Installation

```bash
# Install globally
npm install -g agency-linear

# Then run the setup
agency-linear cursor-setup
```

#### Script-based Installation

```bash
npx agency-linear mcp-install
```

### Manual Setup

If you prefer to configure your assistant manually:

1. Install the package:
   ```bash
   npm install -g agency-linear
   ```

2. Edit your MCP configuration file:

   **For Cursor:**
   - Mac: `~/.cursor/mcp.json`
   - Windows: `%APPDATA%\Cursor\mcp.json`

   **For Claude Desktop:**
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

3. Add this configuration:
   ```json
   {
     "mcpServers": {
       "agency-linear": {
         "command": "npx",
         "args": ["agency-linear"],
         "env": {
           "LINEAR_API_KEY": "your-api-key-here"
         },
         "disabled": false,
         "alwaysAllow": []
       }
     }
   }
   ```

4. Replace `your-api-key-here` with your actual Linear API key

5. Restart your AI assistant

## Using Linear MCP

After installation, your AI assistant can use commands like:
- "Create a new Linear issue for the Engineering team"
- "List all my open Linear issues"
- "Show me the details of issue ENG-123"
- "Create a comment on issue ENG-456"

The assistant will automatically use the MCP tools to interact with Linear.

## Available Tools

### Issue Management
- `create_issue` - Create a new issue
- `list_issues` - List issues with filters
- `update_issue` - Update an existing issue
- `get_issue` - Get detailed issue information
- `search_issues` - Search for issues using text queries
- `create_comment` - Create a comment on an issue
- `update_comment` - Update an existing comment

### Team Management
- `list_teams` - List all teams
- `create_team` - Create a new team
- `update_team` - Update an existing team
- `delete_team` - Delete or archive a team

### Project Management
- `list_projects` - List all projects
- `create_project` - Create a new project
- `update_project` - Update an existing project
- `get_project` - Get detailed project information
- `list_project_milestones` - List milestones for a project
- `create_project_milestone` - Create a new milestone
- `update_project_milestone` - Update a milestone
- `delete_project_milestone` - Delete a milestone

### User Management
- `list_users` - List all users
- `get_user` - Get detailed user information

### Label Management
- `list_labels` - List all labels
- `create_label` - Create a new label
- `update_label` - Update an existing label
- `delete_label` - Delete a label

## Troubleshooting

### Common Issues

**Linear API Key Issues:**
- Ensure your API key is valid and has the necessary permissions
- Check that the key is correctly entered in your configuration

**MCP Not Found:**
- Make sure the package is installed: `npm list -g agency-linear`
- Try using the full path to the executable

**Cursor Configuration Issues:**
- Verify your mcp.json file exists and contains the agency-linear configuration
- Restart Cursor after making configuration changes

## For Developers

### Local Development

For development with auto-rebuild:

```bash
git clone https://github.com/YevUA/BetterLinearMCP.git
cd BetterLinearMCP
npm install
npm run watch
```

### Technical Details

Built with:
- TypeScript
- Linear SDK (@linear/sdk v37.0.0)
- MCP SDK (@modelcontextprotocol/sdk v0.6.0)

## License

MIT
