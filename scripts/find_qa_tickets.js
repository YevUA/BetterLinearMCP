import { LinearClient } from '@linear/sdk';

async function findQATickets() {
  try {
    const linearClient = new LinearClient({
      apiKey: process.env.LINEAR_API_KEY
    });
    
    // First get all teams
    const teamsResult = await linearClient.teams();
    const teams = teamsResult.nodes;
    console.log(`Found ${teams.length} teams`);
    
    // Get all workflow states to find QA status IDs
    const workflowStatesResult = await linearClient.workflowStates({
      includeTeams: true
    });
    
    const qaStates = workflowStatesResult.nodes.filter(state => 
      state.name.toLowerCase().includes('qa') || 
      state.description?.toLowerCase().includes('qa')
    );
    
    if (qaStates.length === 0) {
      console.log('No QA status found in your Linear teams.');
      return;
    }
    
    console.log(`\nFound ${qaStates.length} QA states:`);
    qaStates.forEach(state => {
      // Try to get team info
      const teamId = state.teamId;
      const team = teams.find(t => t.id === teamId);
      console.log(`- ${state.name} (${state.id}) in team: ${team?.name || 'Unknown'} (${teamId || 'Unknown ID'})`);
    });
    
    console.log('\nFinding issues in QA status...');
    
    // Get all issues with QA status
    const qaStateIds = qaStates.map(state => state.id);
    
    // Query for issues in QA status
    let allIssues = [];
    
    // We need to query each QA state separately
    for (const stateId of qaStateIds) {
      const state = qaStates.find(s => s.id === stateId);
      const teamId = state?.teamId;
      
      try {
        const issuesResult = await linearClient.issues({
          filter: {
            state: { id: { eq: stateId } }
          },
          first: 100
        });
        
        console.log(`Found ${issuesResult.nodes.length} issues in state ${state?.name || stateId}`);
        allIssues = [...allIssues, ...issuesResult.nodes];
      } catch (error) {
        console.error(`Error querying issues for state ${state?.name || stateId}:`, error.message);
      }
    }
    
    console.log(`\nFound ${allIssues.length} issues in QA status:\n`);
    
    allIssues.forEach(issue => {
      const team = teams.find(t => t.id === issue.teamId);
      console.log(`[${team?.name || 'Unknown'} - ${issue.teamId}] ${issue.identifier}: ${issue.title}`);
      console.log(`Status: ${issue.state?.name || 'Unknown'}`);
      console.log(`Assignee: ${issue.assignee?.name || 'Unassigned'}`);
      console.log(`URL: ${issue.url}`);
      console.log('-------------------------------------------');
    });
    
    // If no issues found in QA states, let's also check for issues in "Ready for Review" status
    if (allIssues.length === 0) {
      console.log("\nNo issues found in QA states. Checking for issues in 'Ready for Review' status...");
      
      const reviewStates = workflowStatesResult.nodes.filter(state => 
        state.name.toLowerCase().includes('review') || 
        state.description?.toLowerCase().includes('review')
      );
      
      const reviewStateIds = reviewStates.map(state => state.id);
      let reviewIssues = [];
      
      for (const stateId of reviewStateIds) {
        const state = reviewStates.find(s => s.id === stateId);
        
        try {
          const issuesResult = await linearClient.issues({
            filter: {
              state: { id: { eq: stateId } }
            },
            first: 100
          });
          
          console.log(`Found ${issuesResult.nodes.length} issues in state ${state?.name || stateId}`);
          reviewIssues = [...reviewIssues, ...issuesResult.nodes];
        } catch (error) {
          console.error(`Error querying issues for state ${state?.name || stateId}:`, error.message);
        }
      }
      
      console.log(`\nFound ${reviewIssues.length} issues in Review status:\n`);
      
      reviewIssues.forEach(issue => {
        const team = teams.find(t => t.id === issue.teamId);
        console.log(`[${team?.name || 'Unknown'} - ${issue.teamId}] ${issue.identifier}: ${issue.title}`);
        console.log(`Status: ${issue.state?.name || 'Unknown'}`);
        console.log(`Assignee: ${issue.assignee?.name || 'Unassigned'}`);
        console.log(`URL: ${issue.url}`);
        console.log('-------------------------------------------');
      });
    }
    
  } catch (error) {
    console.error('Error finding tickets:', error.message);
  }
}

findQATickets(); 