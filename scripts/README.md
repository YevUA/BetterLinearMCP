# Custom Linear Scripts

This folder contains custom scripts for interacting with the Linear API using the Linear SDK.

## Available Scripts

### Basic Tests

- `test.js` - A basic test script to verify the Linear API connection and list teams.

### Issue Management

- `create_test_ticket.js` - Creates a test ticket in the Stonkd project with a random description and adds a comment to it.
- `find_qa_tickets.js` - Finds all tickets in QA status across all teams.
- `my_issues.js` - Lists all issues assigned to the current user, grouped by state.
- `team_issues.js` - Lists all active issues for a specific team (defaults to 'specswap' if not specified).

## Usage

### Using the Helper Script

The easiest way to run these scripts is with the helper shell script:

```bash
./run_script.sh script_name [args]
```

For example:

```bash
./run_script.sh my_issues
./run_script.sh team_issues stonkd
```

This helper script will:
- Load your Linear API key from the .env file or environment
- Check if the script exists
- Run the script with any arguments you provide

### Manual Execution

Alternatively, you can run any script directly with Node.js:

```bash
LINEAR_API_KEY=your_api_key node scripts/script_name.js
```

For example:

```bash
LINEAR_API_KEY=your_api_key node scripts/my_issues.js
```

For the `team_issues.js` script, you can specify a team name as an argument:

```bash
LINEAR_API_KEY=your_api_key node scripts/team_issues.js stonkd
```

## Notes

- These scripts use the Linear SDK directly with your Linear API key.
- Some scripts use GraphQL mutations directly when the SDK methods don't provide the needed functionality.
- All data is processed locally and only sent to Linear's API. 