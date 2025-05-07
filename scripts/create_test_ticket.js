import { LinearClient } from '@linear/sdk';

async function createTestTicket() {
  try {
    const linearClient = new LinearClient({
      apiKey: process.env.LINEAR_API_KEY
    });
    
    // Get current user info
    const me = await linearClient.viewer;
    console.log(`Current user: ${me.name} (${me.id})`);
    
    // Find the Stonkd team
    const teamsResult = await linearClient.teams();
    const teams = teamsResult.nodes;
    const stonkdTeam = teams.find(team => team.name.toLowerCase() === 'stonkd');
    
    if (!stonkdTeam) {
      console.error('Stonkd team not found!');
      return;
    }
    
    console.log(`Found Stonkd team with ID: ${stonkdTeam.id}`);
    
    // Get workflow states to find the initial state
    const workflowStates = await linearClient.workflowStates({
      filter: {
        team: { id: { eq: stonkdTeam.id } }
      }
    });
    
    const todoState = workflowStates.nodes.find(state => 
      state.name.toLowerCase() === 'to-do' || 
      state.name.toLowerCase() === 'todo' ||
      state.name.toLowerCase() === 'backlog'
    );
    
    // Create a new issue using the issues API
    const title = `Test Ticket ${new Date().toISOString().split('T')[0]}`;
    const description = `This is a test ticket created on ${new Date().toLocaleString()}.\n\nRandom description with some *markdown* formatting and a **bold statement**.\n\n- Bullet point 1\n- Bullet point 2\n\n## Heading\nSome more text here.`;
    
    console.log('Creating new issue with title:', title);
    
    // Use the GraphQL API directly with mutation
    const mutation = `
      mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            url
          }
        }
      }
    `;
    
    const variables = {
      input: {
        title,
        description,
        teamId: stonkdTeam.id,
        assigneeId: me.id,
        priority: 3 // Medium priority
      }
    };
    
    // Add state if found
    if (todoState) {
      variables.input.stateId = todoState.id;
      console.log(`Using initial state: ${todoState.name}`);
    }
    
    // Execute the GraphQL mutation directly
    const response = await linearClient.client.request(mutation, variables);
    console.log('Full issue creation response:', JSON.stringify(response, null, 2));
    
    if (response.issueCreate.success) {
      const issue = response.issueCreate.issue;
      console.log(`Successfully created issue: ${issue.identifier} - ${issue.title}`);
      console.log(`Issue ID: ${issue.id}`);
      console.log(`URL: ${issue.url}`);
      
      // Add a comment to the issue using mutation
      const commentMutation = `
        mutation CommentCreate($input: CommentCreateInput!) {
          commentCreate(input: $input) {
            success
            comment {
              id
            }
          }
        }
      `;
      
      const commentVariables = {
        input: {
          issueId: issue.id,
          body: "This is the first comment on this test ticket. Adding some additional context here."
        }
      };
      
      const commentResponse = await linearClient.client.request(commentMutation, commentVariables);
      console.log('Comment creation response:', JSON.stringify(commentResponse, null, 2));
      
      if (commentResponse.commentCreate.success) {
        console.log('Successfully added comment to the issue');
      } else {
        console.error('Failed to add comment');
      }
    } else {
      console.error('Failed to create issue');
    }
    
  } catch (error) {
    console.error('Error creating test ticket:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.errors);
    }
  }
}

createTestTicket(); 