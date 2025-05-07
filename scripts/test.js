import { LinearClient } from '@linear/sdk';

async function test() {
  try {
    const linearClient = new LinearClient({
      apiKey: process.env.LINEAR_API_KEY
    });
    
    // Test by listing teams
    const teams = await linearClient.teams();
    console.log('Teams:');
    teams.nodes.forEach(team => {
      console.log(`- ${team.name} (${team.id})`);
    });
    
    console.log('\nAPI connection successful!');
  } catch (error) {
    console.error('Error connecting to Linear API:', error.message);
  }
}

test(); 