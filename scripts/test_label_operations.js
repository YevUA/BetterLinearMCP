#!/usr/bin/env node
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Load .env file from the project root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env") });

import { LinearClient } from "@linear/sdk";

const API_KEY = process.env.LINEAR_API_KEY || process.env.LINEARAPIKEY;
if (!API_KEY) {
  console.error("Error: LINEAR_API_KEY environment variable is required");
  process.exit(1);
}

const linearClient = new LinearClient({
  apiKey: API_KEY,
});

const TEAM_ID = "85ae30f1-f11f-4982-9b62-6b9ca45ea262"; // Stonkd team

async function testLabelOperations() {
  console.log("Testing Label Operations...");
  
  try {
    // 1. List labels
    console.log("\n1. Listing labels...");
    const query = `
      query Labels($teamId: ID) {
        issueLabels(filter: { team: { id: { eq: $teamId } } }) {
          nodes {
            id
            name
            color
            description
            team {
              id
              name
            }
          }
        }
      }
    `;
    
    const variables = {
      teamId: TEAM_ID,
    };
    
    const result = await linearClient.client.rawRequest(query, variables);
    const labels = (result.data?.issueLabels?.nodes || []);
    console.log(`Found ${labels.length} labels:`);
    labels.forEach(label => {
      console.log(`- ${label.name} (${label.id}): ${label.description || 'No description'} [Color: ${label.color}]`);
    });
    
    // 2. Create a label
    console.log("\n2. Creating a new label...");
    const createMutation = `
      mutation LabelCreate($input: IssueLabelCreateInput!) {
        issueLabelCreate(input: $input) {
          success
          issueLabel {
            id
            name
            color
            description
          }
        }
      }
    `;
    
    const createVariables = {
      input: {
        name: "Test Label " + new Date().toISOString(),
        color: "#FF5733",
        description: "A test label created via MCP script",
        teamId: TEAM_ID,
      },
    };
    
    const createResult = await linearClient.client.rawRequest(createMutation, createVariables);
    if (!createResult.data?.issueLabelCreate?.success) {
      throw new Error("Failed to create label");
    }
    
    const newLabel = createResult.data.issueLabelCreate.issueLabel;
    console.log(`Created label: ${newLabel.name} (${newLabel.id})`);
    
    // 3. Update the label
    console.log("\n3. Updating the label...");
    const updateMutation = `
      mutation LabelUpdate($id: String!, $input: IssueLabelUpdateInput!) {
        issueLabelUpdate(id: $id, input: $input) {
          success
          issueLabel {
            id
            name
            color
            description
          }
        }
      }
    `;
    
    const updateVariables = {
      id: newLabel.id,
      input: {
        name: newLabel.name + " (Updated)",
        color: "#33FF57",
        description: "This label was updated via MCP script",
      },
    };
    
    const updateResult = await linearClient.client.rawRequest(updateMutation, updateVariables);
    if (!updateResult.data?.issueLabelUpdate?.success) {
      throw new Error("Failed to update label");
    }
    
    const updatedLabel = updateResult.data.issueLabelUpdate.issueLabel;
    console.log(`Updated label: ${updatedLabel.name} (${updatedLabel.id})`);
    
    // 4. Delete the label
    console.log("\n4. Deleting the label...");
    const deleteMutation = `
      mutation LabelDelete($id: String!) {
        issueLabelDelete(id: $id) {
          success
        }
      }
    `;
    
    const deleteVariables = {
      id: newLabel.id,
    };
    
    const deleteResult = await linearClient.client.rawRequest(deleteMutation, deleteVariables);
    if (!deleteResult.data?.issueLabelDelete?.success) {
      throw new Error("Failed to delete label");
    }
    
    console.log(`Deleted label: ${updatedLabel.name} (${updatedLabel.id})`);
    console.log("\nAll label operations completed successfully!");
    
  } catch (error) {
    console.error("Error during label operations:", error);
  }
}

testLabelOperations(); 