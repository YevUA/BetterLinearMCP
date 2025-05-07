import { LinearClient } from '@linear/sdk';

async function findTeamIssues(teamName) {
  try {
    const linearClient = new LinearClient({
      apiKey: process.env.LINEAR_API_KEY
    });
    
    // Get current user info
    const me = await linearClient.viewer;
    console.log(`Current user: ${me.name} (${me.id})`);
    
    // Get all teams
    const teamsResult = await linearClient.teams();
    const teams = teamsResult.nodes;
    console.log(`Found ${teams.length} teams`);
    
    // Find the specified team
    const team = teams.find(t => t.name.toLowerCase().includes(teamName.toLowerCase()));
    
    if (!team) {
      console.log(`\nNo team found matching "${teamName}". Available teams:`);
      teams.forEach(team => {
        console.log(`- ${team.name} (${team.key})`);
      });
      return;
    }
    
    console.log(`\nFound team: ${team.name} (${team.key})`);
    
    // Get workflow states for this team
    const workflowStatesResult = await linearClient.workflowStates({
      filter: {
        team: { id: { eq: team.id } }
      }
    });
    
    console.log(`\nWorkflow states for ${team.name}:`);
    workflowStatesResult.nodes.forEach(state => {
      console.log(`- ${state.name} (${state.id})`);
    });
    
    // Get active issues for this team
    const activeIssues = await linearClient.issues({
      filter: {
        team: { id: { eq: team.id } },
        state: { 
          type: { 
            nin: ["completed", "canceled"] 
          }
        }
      },
      orderBy: "updatedAt",
      first: 100
    });
    
    console.log(`\nFound ${activeIssues.nodes.length} active issues for team ${team.name}:\n`);
    
    // Group issues by state
    const issuesByState = {};
    
    activeIssues.nodes.forEach(issue => {
      const stateName = issue.state?.name || 'Unknown';
      if (!issuesByState[stateName]) {
        issuesByState[stateName] = [];
      }
      issuesByState[stateName].push(issue);
    });
    
    // Display issues by state
    for (const [stateName, issues] of Object.entries(issuesByState)) {
      console.log(`\n--- ${stateName} (${issues.length} issues) ---\n`);
      
      issues.forEach(issue => {
        const assignee = issue.assignee?.name || 'Unassigned';
        console.log(`${issue.identifier}: ${issue.title}`);
        console.log(`Assignee: ${assignee}`);
        console.log(`Priority: ${getPriorityLabel(issue.priority)}`);
        console.log(`URL: ${issue.url}`);
        console.log('-------------------------------------------');
      });
    }
    
  } catch (error) {
    console.error('Error finding team issues:', error.message);
  }
}

// Helper function to get priority label
function getPriorityLabel(priority) {
  switch (priority) {
    case 0: return 'No priority';
    case 1: return 'Urgent';
    case 2: return 'High';
    case 3: return 'Medium';
    case 4: return 'Low';
    default: return 'Unknown';
  }
}

// Get team name from command line arguments
const teamName = process.argv[2] || 'specswap';
findTeamIssues(teamName); 