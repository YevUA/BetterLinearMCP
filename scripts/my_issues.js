import { LinearClient } from '@linear/sdk';

async function findMyIssues() {
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
    
    // Get all workflow states to help with filtering
    const workflowStatesResult = await linearClient.workflowStates();
    const states = workflowStatesResult.nodes;
    
    // Get all issues assigned to me
    const myIssues = await linearClient.issues({
      filter: {
        assignee: { id: { eq: me.id } }
      },
      first: 100
    });
    
    console.log(`\nFound ${myIssues.nodes.length} issues assigned to you:\n`);
    
    // Group issues by state
    const issuesByState = {};
    
    myIssues.nodes.forEach(issue => {
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
        const team = teams.find(t => t.id === issue.teamId);
        console.log(`[${team?.name || 'Unknown'}] ${issue.identifier}: ${issue.title}`);
        console.log(`Priority: ${getPriorityLabel(issue.priority)}`);
        console.log(`URL: ${issue.url}`);
        console.log('-------------------------------------------');
      });
    }
    
    // If no issues assigned to me, show all active issues in the workspace
    if (myIssues.nodes.length === 0) {
      console.log("\nNo issues assigned to you. Showing recent active issues in the workspace...");
      
      const activeIssues = await linearClient.issues({
        filter: {
          state: { 
            type: { 
              nin: ["completed", "canceled"] 
            }
          }
        },
        orderBy: "updatedAt",
        first: 20
      });
      
      console.log(`\nFound ${activeIssues.nodes.length} active issues:\n`);
      
      activeIssues.nodes.forEach(issue => {
        const team = teams.find(t => t.id === issue.teamId);
        const assignee = issue.assignee?.name || 'Unassigned';
        console.log(`[${team?.name || 'Unknown'}] ${issue.identifier}: ${issue.title}`);
        console.log(`Status: ${issue.state?.name || 'Unknown'}`);
        console.log(`Assignee: ${assignee}`);
        console.log(`Priority: ${getPriorityLabel(issue.priority)}`);
        console.log(`URL: ${issue.url}`);
        console.log('-------------------------------------------');
      });
    }
    
  } catch (error) {
    console.error('Error finding issues:', error.message);
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

findMyIssues(); 