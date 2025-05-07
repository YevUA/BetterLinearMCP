# Linear MCP Server

> Note: This is a custom implementation. For the official Cline Linear MCP server, see [cline/linear-mcp](https://github.com/cline/linear-mcp).

<a href="https://glama.ai/mcp/servers/71fqw0uqmx"> <img width="380" height="200" src="https://glama.ai/mcp/servers/71fqw0uqmx/badge" />

A Model Context Protocol (MCP) server that provides tools for interacting with Linear's API, enabling AI agents to manage issues, projects, and teams programmatically through the Linear platform.

## Features

- **Issue Management**
  - Create new issues with customizable properties (title, description, team, assignee, priority, labels)
  - List issues with flexible filtering options (team, assignee, status)
  - Update existing issues (title, description, status, assignee, priority)
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

## Installation

### Option 1: NPM Package

Install globally:

```bash
npm install -g agency-linear
```

Or use with npx:

```bash
npx agency-linear
```

### Option 2: One-line Cursor Setup

The quickest way to configure the MCP server for Cursor:

```bash
npx agency-linear cursor-setup
```

This will guide you through the setup process and configure Cursor to use the agency-linear MCP server.

### Option 3: Script-based Cursor Setup

Alternatively, use the script-based installer:

```bash
npx agency-linear mcp-install
```

### Option 4: Manual Setup

1. Get your Linear API key from Linear's Developer Settings
2. Run with your API key:

```bash
LINEAR_API_KEY=your-api-key npx agency-linear
```

Or set it in your environment:

```bash
export LINEAR_API_KEY=your-api-key
npx agency-linear
```

## Configuration

Configure the MCP server in your settings file based on your client:

### For Cursor

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

### For Claude Desktop

* MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
* Windows: `%APPDATA%/Claude/claude_desktop_config.json`

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

## Development

For development with auto-rebuild:

```bash
npm run watch
```

## Error Handling

The server includes comprehensive error handling for:

- Invalid API keys
- Missing required parameters
- Linear API errors
- Invalid tool requests

All errors are properly formatted and returned with descriptive messages.

## Technical Details

Built with:

- TypeScript
- Linear SDK (@linear/sdk v37.0.0)
- MCP SDK (@modelcontextprotocol/sdk v0.6.0)

The server uses stdio for communication and implements the Model Context Protocol for seamless integration with AI agents.

## License

MIT

## Custom Scripts

This repository includes custom utility scripts to help you interact with the Linear API. These scripts demonstrate common use cases and can be modified to suit your needs.

### Available Scripts

- `scripts/test.js` - A basic test script to verify the Linear API connection
- `scripts/create_test_ticket.js` - Creates a test ticket with a comment
- `scripts/find_qa_tickets.js` - Finds all tickets in QA status
- `scripts/my_issues.js` - Lists all issues assigned to the current user
- `scripts/team_issues.js` - Lists all active issues for a specific team

For more details, see the [scripts/README.md](scripts/README.md) file.

### Running Scripts

Use the provided helper script to easily run any of the custom scripts:

```bash
./run_script.sh script_name [args]
```

For example:

```bash
./run_script.sh my_issues
./run_script.sh team_issues stonkd
```

Or run them directly with Node.js:

```bash
LINEAR_API_KEY=your-api-key node scripts/script_name.js
```
