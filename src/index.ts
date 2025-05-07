#!/usr/bin/env node

import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Load .env file from the project root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env") });

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Request } from "@modelcontextprotocol/sdk/types.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { LinearClient } from "@linear/sdk";

const API_KEY = process.env.LINEAR_API_KEY || process.env.LINEARAPIKEY;
if (!API_KEY) {
  console.error("Error: LINEAR_API_KEY environment variable is required");
  console.error("");
  console.error("To use this tool, run it with your Linear API key:");
  console.error("LINEAR_API_KEY=your-api-key npx @ibraheem4/linear-mcp");
  console.error("");
  console.error("Or set it in your environment:");
  console.error("export LINEAR_API_KEY=your-api-key");
  console.error("npx @ibraheem4/linear-mcp");
  process.exit(1);
}

const linearClient = new LinearClient({
  apiKey: API_KEY,
});

const server = new Server(
  {
    name: "linear-mcp",
    version: "37.0.0", // Match Linear SDK version
  },
  {
    capabilities: {
      tools: {
        create_issue: true,
        list_issues: true,
        update_issue: true,
        list_teams: true,
        list_projects: true,
        search_issues: true,
        get_issue: true,
        update_comment: true,
        create_comment: true,
        list_labels: true,
        create_label: true,
        update_label: true,
        delete_label: true,
        list_users: true,
        get_user: true,
        get_current_user: true,
        create_team: true,
        update_team: true,
        delete_team: true,
        create_project: true,
        update_project: true,
        get_project: true,
        list_project_milestones: true,
        create_project_milestone: true,
        update_project_milestone: true,
        delete_project_milestone: true,
      },
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "create_issue",
      description: "Create a new issue in Linear",
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Issue title",
          },
          description: {
            type: "string",
            description: "Issue description (markdown supported)",
          },
          teamId: {
            type: "string",
            description: "Team ID",
          },
          assigneeId: {
            type: "string",
            description: "Assignee user ID (optional)",
          },
          priority: {
            type: "number",
            description: "Priority (0-4, optional)",
            minimum: 0,
            maximum: 4,
          },
          labels: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Label IDs to apply (optional)",
          },
          projectId: {
            type: "string",
            description: "Project ID to assign the issue to (optional)",
          },
        },
        required: ["title", "teamId"],
      },
    },
    {
      name: "list_issues",
      description: "List issues with optional filters",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Filter by team ID (optional)",
          },
          assigneeId: {
            type: "string",
            description: "Filter by assignee ID (optional)",
          },
          status: {
            type: "string",
            description: "Filter by status (optional)",
          },
          first: {
            type: "number",
            description: "Number of issues to return (default: 50)",
          },
        },
      },
    },
    {
      name: "update_issue",
      description: "Update an existing issue",
      inputSchema: {
        type: "object",
        properties: {
          issueId: {
            type: "string",
            description: "Issue ID",
          },
          title: {
            type: "string",
            description: "New title (optional)",
          },
          description: {
            type: "string",
            description: "New description (optional)",
          },
          status: {
            type: "string",
            description: "New status (optional)",
          },
          assigneeId: {
            type: "string",
            description: "New assignee ID (optional)",
          },
          priority: {
            type: "number",
            description: "New priority (0-4, optional)",
            minimum: 0,
            maximum: 4,
          },
          projectId: {
            type: "string",
            description: "Project ID to assign the issue to (optional)",
          },
        },
        required: ["issueId"],
      },
    },
    {
      name: "list_teams",
      description: "List all teams in the workspace",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "list_projects",
      description: "List all projects",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Filter by team ID (optional)",
          },
          first: {
            type: "number",
            description: "Number of projects to return (default: 50)",
          },
        },
      },
    },
    {
      name: "search_issues",
      description: "Search for issues using a text query",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query text",
          },
          first: {
            type: "number",
            description: "Number of results to return (default: 50)",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "get_issue",
      description: "Get detailed information about a specific issue",
      inputSchema: {
        type: "object",
        properties: {
          issueId: {
            type: "string",
            description: "Issue ID",
          },
        },
        required: ["issueId"],
      },
    },
    {
      name: "update_comment",
      description: "Update an existing comment",
      inputSchema: {
        type: "object",
        properties: {
          commentId: {
            type: "string",
            description: "Comment ID",
          },
          body: {
            type: "string",
            description: "New comment text",
          },
        },
        required: ["commentId", "body"],
      },
    },
    {
      name: "create_comment",
      description: "Create a new comment on an issue",
      inputSchema: {
        type: "object",
        properties: {
          issueId: {
            type: "string",
            description: "Issue ID",
          },
          body: {
            type: "string",
            description: "Comment text (markdown supported)",
          },
        },
        required: ["issueId", "body"],
      },
    },
    {
      name: "list_labels",
      description: "List all labels with optional filters",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Filter by team ID (optional)",
          },
          first: {
            type: "number",
            description: "Number of labels to return (default: 50)",
          },
        },
      },
    },
    {
      name: "create_label",
      description: "Create a new label",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Label name",
          },
          color: {
            type: "string",
            description: "Label color (hex code, optional)",
          },
          description: {
            type: "string",
            description: "Label description (optional)",
          },
          teamId: {
            type: "string",
            description: "Team ID",
          },
        },
        required: ["name", "teamId"],
      },
    },
    {
      name: "update_label",
      description: "Update an existing label",
      inputSchema: {
        type: "object",
        properties: {
          labelId: {
            type: "string",
            description: "Label ID",
          },
          name: {
            type: "string",
            description: "New label name (optional)",
          },
          color: {
            type: "string",
            description: "New label color (hex code, optional)",
          },
          description: {
            type: "string",
            description: "New label description (optional)",
          },
        },
        required: ["labelId"],
      },
    },
    {
      name: "delete_label",
      description: "Delete a label",
      inputSchema: {
        type: "object",
        properties: {
          labelId: {
            type: "string",
            description: "Label ID",
          },
        },
        required: ["labelId"],
      },
    },
    {
      name: "list_users",
      description: "List all users in the workspace",
      inputSchema: {
        type: "object",
        properties: {
          first: {
            type: "number",
            description: "Number of users to return (default: 50)",
          },
        },
      },
    },
    {
      name: "get_user",
      description: "Get detailed information about a specific user",
      inputSchema: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "User ID",
          },
        },
        required: ["userId"],
      },
    },
    {
      name: "get_current_user",
      description: "Get information about the currently authenticated user (API key owner)",
      inputSchema: {
        type: "object",
        properties: {
          random_string: {
            type: "string",
            description: "Dummy parameter for no-parameter tools",
          },
        },
        required: ["random_string"],
      },
    },
    {
      name: "create_team",
      description: "Create a new team",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Team name",
          },
          key: {
            type: "string",
            description: "Team key (unique identifier used in issue ids, e.g., 'ENG' for ENG-123)",
          },
          description: {
            type: "string",
            description: "Team description (optional)",
          },
          icon: {
            type: "string",
            description: "Icon name for the team (optional)",
          },
          color: {
            type: "string",
            description: "Color for the team (hex code, optional)",
          },
        },
        required: ["name", "key"],
      },
    },
    {
      name: "update_team",
      description: "Update an existing team",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Team ID",
          },
          name: {
            type: "string",
            description: "New team name (optional)",
          },
          key: {
            type: "string",
            description: "New team key (optional)",
          },
          description: {
            type: "string",
            description: "New team description (optional)",
          },
          icon: {
            type: "string",
            description: "New icon name for the team (optional)",
          },
          color: {
            type: "string",
            description: "New color for the team (hex code, optional)",
          },
        },
        required: ["teamId"],
      },
    },
    {
      name: "delete_team",
      description: "Archive or delete a team",
      inputSchema: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            description: "Team ID",
          },
          archive: {
            type: "boolean",
            description: "Whether to archive (true) or permanently delete (false) the team (default: true)",
          },
        },
        required: ["teamId"],
      },
    },
    {
      name: "create_project",
      description: "Create a new project",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Project name",
          },
          description: {
            type: "string",
            description: "Project description (optional)",
          },
          teamIds: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Team IDs to associate with the project",
          },
          state: {
            type: "string",
            description: "Project state (optional, e.g., 'planned', 'started', 'completed')",
          },
          icon: {
            type: "string",
            description: "Icon for the project (optional)",
          },
          color: {
            type: "string",
            description: "Color for the project (hex code, optional)",
          },
        },
        required: ["name", "teamIds"],
      },
    },
    {
      name: "update_project",
      description: "Update an existing project",
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            description: "Project ID",
          },
          name: {
            type: "string",
            description: "New project name (optional)",
          },
          description: {
            type: "string",
            description: "New project description (optional)",
          },
          state: {
            type: "string",
            description: "New project state (optional, e.g., 'planned', 'started', 'completed')",
          },
          icon: {
            type: "string",
            description: "New icon for the project (optional)",
          },
          color: {
            type: "string",
            description: "New color for the project (hex code, optional)",
          },
        },
        required: ["projectId"],
      },
    },
    {
      name: "get_project",
      description: "Get detailed information about a specific project",
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            description: "Project ID",
          },
        },
        required: ["projectId"],
      },
    },
    {
      name: "list_project_milestones",
      description: "List all milestones for a specific project",
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            description: "Project ID to list milestones for",
          },
          first: {
            type: "number",
            description: "Number of milestones to return (default: 50)",
          },
        },
        required: ["projectId"],
      },
    },
    {
      name: "create_project_milestone",
      description: "Create a new milestone for a project",
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            description: "Project ID to create milestone for",
          },
          name: {
            type: "string",
            description: "Milestone name",
          },
          description: {
            type: "string",
            description: "Milestone description (optional)",
          },
          targetDate: {
            type: "string",
            description: "Target date for the milestone (ISO 8601 format, optional)",
          },
          sortOrder: {
            type: "number",
            description: "Sort order for the milestone (optional)",
          },
        },
        required: ["projectId", "name"],
      },
    },
    {
      name: "update_project_milestone",
      description: "Update an existing project milestone",
      inputSchema: {
        type: "object",
        properties: {
          milestoneId: {
            type: "string",
            description: "Milestone ID to update",
          },
          name: {
            type: "string",
            description: "New milestone name (optional)",
          },
          description: {
            type: "string",
            description: "New milestone description (optional)",
          },
          targetDate: {
            type: "string",
            description: "New target date (ISO 8601 format, optional)",
          },
          sortOrder: {
            type: "number",
            description: "New sort order (optional)",
          },
        },
        required: ["milestoneId"],
      },
    },
    {
      name: "delete_project_milestone",
      description: "Delete a project milestone",
      inputSchema: {
        type: "object",
        properties: {
          milestoneId: {
            type: "string",
            description: "Milestone ID to delete",
          },
        },
        required: ["milestoneId"],
      },
    },
  ],
}));

type CreateIssueArgs = {
  title: string;
  description?: string;
  teamId: string;
  assigneeId?: string;
  priority?: number;
  labels?: string[];
  projectId?: string;
};

type ListIssuesArgs = {
  teamId?: string;
  assigneeId?: string;
  status?: string;
  first?: number;
};

type UpdateIssueArgs = {
  issueId: string;
  title?: string;
  description?: string;
  status?: string;
  assigneeId?: string;
  priority?: number;
  labels?: string[];
  projectId?: string;
};

type ListProjectsArgs = {
  teamId?: string;
  first?: number;
};

type SearchIssuesArgs = {
  query: string;
  first?: number;
};

type GetIssueArgs = {
  issueId: string;
};

type UpdateCommentArgs = {
  commentId: string;
  body: string;
};

type CreateCommentArgs = {
  issueId: string;
  body: string;
};

type ListLabelsArgs = {
  teamId?: string;
  first?: number;
};

type CreateLabelArgs = {
  name: string;
  color?: string;
  description?: string;
  teamId: string;
};

type UpdateLabelArgs = {
  labelId: string;
  name?: string;
  color?: string;
  description?: string;
};

type DeleteLabelArgs = {
  labelId: string;
};

type ListUsersArgs = {
  first?: number;
};

type GetUserArgs = {
  userId: string;
};

type GetCurrentUserArgs = {
  random_string: string;
};

type CreateTeamArgs = {
  name: string;
  key: string;
  description?: string;
  icon?: string;
  color?: string;
};

type UpdateTeamArgs = {
  teamId: string;
  name?: string;
  key?: string;
  description?: string;
  icon?: string;
  color?: string;
};

type DeleteTeamArgs = {
  teamId: string;
  archive?: boolean;
};

type CreateProjectArgs = {
  name: string;
  description?: string;
  teamIds: string[];
  state?: string;
  icon?: string;
  color?: string;
};

type UpdateProjectArgs = {
  projectId: string;
  name?: string;
  description?: string;
  state?: string;
  icon?: string;
  color?: string;
};

type GetProjectArgs = {
  projectId: string;
};

type ListProjectMilestonesArgs = {
  projectId: string;
  first?: number;
};

type CreateProjectMilestoneArgs = {
  projectId: string;
  name: string;
  description?: string;
  targetDate?: string;
  sortOrder?: number;
};

type UpdateProjectMilestoneArgs = {
  milestoneId: string;
  name?: string;
  description?: string;
  targetDate?: string;
  sortOrder?: number;
};

type DeleteProjectMilestoneArgs = {
  milestoneId: string;
};

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "create_issue": {
        const args = request.params.arguments as unknown as CreateIssueArgs;
        if (!args?.title || !args?.teamId) {
          throw new Error("Title and teamId are required");
        }

        const issue = await linearClient.createIssue({
          title: args.title,
          description: args.description,
          teamId: args.teamId,
          assigneeId: args.assigneeId,
          priority: args.priority,
          labelIds: args.labels,
          projectId: args.projectId,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(issue, null, 2),
            },
          ],
        };
      }

      case "list_issues": {
        const args = request.params.arguments as unknown as ListIssuesArgs;
        const filter: Record<string, any> = {};
        if (args?.teamId) filter.team = { id: { eq: args.teamId } };
        if (args?.assigneeId) filter.assignee = { id: { eq: args.assigneeId } };
        if (args?.status) filter.state = { name: { eq: args.status } };

        const issues = await linearClient.issues({
          first: args?.first ?? 50,
          filter,
        });

        const formattedIssues = await Promise.all(
          issues.nodes.map(async (issue) => {
            const state = await issue.state;
            const assignee = await issue.assignee;
            return {
              id: issue.id,
              title: issue.title,
              status: state ? await state.name : "Unknown",
              assignee: assignee ? assignee.name : "Unassigned",
              priority: issue.priority,
              url: issue.url,
            };
          })
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formattedIssues, null, 2),
            },
          ],
        };
      }

      case "update_issue": {
        const args = request.params.arguments as unknown as UpdateIssueArgs;
        if (!args?.issueId) {
          throw new Error("Issue ID is required");
        }

        const issue = await linearClient.issue(args.issueId);
        if (!issue) {
          throw new Error(`Issue ${args.issueId} not found`);
        }

        const updatedIssue = await issue.update({
          title: args.title,
          description: args.description,
          stateId: args.status,
          assigneeId: args.assigneeId,
          labelIds: args.labels,
          priority: args.priority,
          projectId: args.projectId,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(updatedIssue, null, 2),
            },
          ],
        };
      }

      case "list_teams": {
        const query = await linearClient.teams();
        const teams = await Promise.all(
          (query as any).nodes.map(async (team: any) => ({
            id: team.id,
            name: team.name,
            key: team.key,
            description: team.description,
          }))
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(teams, null, 2),
            },
          ],
        };
      }

      case "list_projects": {
        const args = request.params.arguments as unknown as ListProjectsArgs;
        
        // Use GraphQL directly instead of using the SDK's filtering which has issues
        const query = `
          query Projects($first: Int!) {
            projects(first: $first) {
              nodes {
                id
                name
                description
                state
                color
                icon
                createdAt
                updatedAt
                teams {
                  nodes {
                    id
                    name
                    key
                  }
                }
              }
            }
          }
        `;

        const variables = {
          first: args?.first ?? 50
        };

        try {
          const result = await linearClient.client.rawRequest(query, variables);
          const allProjects = (result.data as any)?.projects?.nodes || [];
          
          // Filter projects by team ID if specified
          const filteredProjects = args?.teamId 
            ? allProjects.filter((project: any) => {
                const teamNodes = project.teams?.nodes || [];
                return teamNodes.some((team: any) => team.id === args.teamId);
              })
            : allProjects;
          
          // Format the projects
          const formattedProjects = filteredProjects.map((project: any) => {
            const teamNodes = project.teams?.nodes || [];
            return {
              id: project.id,
              name: project.name,
              description: project.description,
              state: project.state,
              color: project.color,
              icon: project.icon,
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
              teamIds: teamNodes.map((team: any) => team.id),
              teams: teamNodes.map((team: any) => ({
                id: team.id,
                name: team.name,
                key: team.key
              }))
            };
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(formattedProjects, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error listing projects:", error);
          throw new Error(`Failed to list projects: ${error.message}`);
        }
      }

      case "search_issues": {
        const args = request.params.arguments as unknown as SearchIssuesArgs;
        if (!args?.query) {
          throw new Error("Search query is required");
        }

        const searchResults = await linearClient.searchIssues(args.query, {
          first: args?.first ?? 50,
        });

        const formattedResults = await Promise.all(
          searchResults.nodes.map(async (result) => {
            const state = await result.state;
            const assignee = await result.assignee;
            return {
              id: result.id,
              title: result.title,
              status: state ? await state.name : "Unknown",
              assignee: assignee ? assignee.name : "Unassigned",
              priority: result.priority,
              url: result.url,
              metadata: result.metadata,
            };
          })
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formattedResults, null, 2),
            },
          ],
        };
      }

      case "get_issue": {
        const args = request.params.arguments as unknown as GetIssueArgs;
        if (!args?.issueId) {
          throw new Error("Issue ID is required");
        }

        const issue = await linearClient.issue(args.issueId);
        if (!issue) {
          throw new Error(`Issue ${args.issueId} not found`);
        }

        try {
          const [
            state,
            assignee,
            creator,
            team,
            project,
            parent,
            cycle,
            labels,
            comments,
            attachments,
          ] = await Promise.all([
            issue.state,
            issue.assignee,
            issue.creator,
            issue.team,
            issue.project,
            issue.parent,
            issue.cycle,
            issue.labels(),
            issue.comments(),
            issue.attachments(),
          ]);

          const issueDetails: {
            id: string;
            identifier: string;
            title: string;
            description: string | undefined;
            priority: number;
            priorityLabel: string;
            status: string;
            url: string;
            createdAt: Date;
            updatedAt: Date;
            startedAt: Date | null;
            completedAt: Date | null;
            canceledAt: Date | null;
            dueDate: string | null;
            assignee: { id: string; name: string; email: string } | null;
            creator: { id: string; name: string; email: string } | null;
            team: { id: string; name: string; key: string } | null;
            project: { id: string; name: string; state: string } | null;
            parent: { id: string; title: string; identifier: string } | null;
            cycle: { id: string; name: string; number: number } | null;
            labels: Array<{ id: string; name: string; color: string }>;
            comments: Array<{ id: string; body: string; createdAt: Date }>;
            attachments: Array<{ id: string; title: string; url: string }>;
            embeddedImages: Array<{ url: string; analysis: string }>;
            estimate: number | null;
            customerTicketCount: number;
            previousIdentifiers: string[];
            branchName: string;
            archivedAt: Date | null;
            autoArchivedAt: Date | null;
            autoClosedAt: Date | null;
            trashed: boolean;
          } = {
            id: issue.id,
            identifier: issue.identifier,
            title: issue.title,
            description: issue.description,
            priority: issue.priority,
            priorityLabel: issue.priorityLabel,
            status: state ? await state.name : "Unknown",
            url: issue.url,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
            startedAt: issue.startedAt || null,
            completedAt: issue.completedAt || null,
            canceledAt: issue.canceledAt || null,
            dueDate: issue.dueDate,
            assignee: assignee
              ? {
                  id: assignee.id,
                  name: assignee.name,
                  email: assignee.email,
                }
              : null,
            creator: creator
              ? {
                  id: creator.id,
                  name: creator.name,
                  email: creator.email,
                }
              : null,
            team: team
              ? {
                  id: team.id,
                  name: team.name,
                  key: team.key,
                }
              : null,
            project: project
              ? {
                  id: project.id,
                  name: project.name,
                  state: project.state,
                }
              : null,
            parent: parent
              ? {
                  id: parent.id,
                  title: parent.title,
                  identifier: parent.identifier,
                }
              : null,
            cycle:
              cycle && cycle.name
                ? {
                    id: cycle.id,
                    name: cycle.name,
                    number: cycle.number,
                  }
                : null,
            labels: await Promise.all(
              labels.nodes.map(async (label: any) => ({
                id: label.id,
                name: label.name,
                color: label.color,
              }))
            ),
            comments: await Promise.all(
              comments.nodes.map(async (comment: any) => ({
                id: comment.id,
                body: comment.body,
                createdAt: comment.createdAt,
              }))
            ),
            attachments: await Promise.all(
              attachments.nodes.map(async (attachment: any) => ({
                id: attachment.id,
                title: attachment.title,
                url: attachment.url,
              }))
            ),
            embeddedImages: [],
            estimate: issue.estimate || null,
            customerTicketCount: issue.customerTicketCount || 0,
            previousIdentifiers: issue.previousIdentifiers || [],
            branchName: issue.branchName || "",
            archivedAt: issue.archivedAt || null,
            autoArchivedAt: issue.autoArchivedAt || null,
            autoClosedAt: issue.autoClosedAt || null,
            trashed: issue.trashed || false,
          };

          // Extract embedded images from description
          const imageMatches =
            issue.description?.match(/!\[.*?\]\((.*?)\)/g) || [];
          if (imageMatches.length > 0) {
            issueDetails.embeddedImages = imageMatches.map((match) => {
              const url = (match as string).match(/\((.*?)\)/)?.[1] || "";
              return {
                url,
                analysis: "Image analysis would go here", // Replace with actual image analysis if available
              };
            });
          }

          // Add image analysis for attachments if they are images
          issueDetails.attachments = await Promise.all(
            attachments.nodes
              .filter((attachment: any) =>
                attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
              )
              .map(async (attachment: any) => ({
                id: attachment.id,
                title: attachment.title,
                url: attachment.url,
                analysis: "Image analysis would go here", // Replace with actual image analysis if available
              }))
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(issueDetails, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error processing issue details:", error);
          throw new Error(`Failed to process issue details: ${error.message}`);
        }
      }

      case "update_comment": {
        const args = request.params.arguments as unknown as UpdateCommentArgs;
        if (!args?.commentId) {
          throw new Error("Comment ID is required");
        }
        if (!args?.body) {
          throw new Error("Comment body is required");
        }

        // Use the Linear GraphQL API directly to update a comment
        const mutation = `
          mutation CommentUpdate($id: String!, $input: CommentUpdateInput!) {
            commentUpdate(id: $id, input: $input) {
              success
              comment {
                id
                body
                updatedAt
              }
            }
          }
        `;

        const variables = {
          id: args.commentId,
          input: {
            body: args.body,
          },
        };

        try {
          const result = await linearClient.client.rawRequest(mutation, variables);
          
          if (!(result.data as any)?.commentUpdate?.success) {
            throw new Error("Failed to update comment");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify((result.data as any).commentUpdate, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error updating comment:", error);
          throw new Error(`Failed to update comment: ${error.message}`);
        }
      }

      case "create_comment": {
        const args = request.params.arguments as unknown as CreateCommentArgs;
        if (!args?.issueId) {
          throw new Error("Issue ID is required");
        }
        if (!args?.body) {
          throw new Error("Comment body is required");
        }

        // Use the Linear GraphQL API to create a comment
        const mutation = `
          mutation CommentCreate($input: CommentCreateInput!) {
            commentCreate(input: $input) {
              success
              comment {
                id
                body
                createdAt
                user {
                  id
                  name
                }
              }
            }
          }
        `;

        const variables = {
          input: {
            issueId: args.issueId,
            body: args.body,
          },
        };

        try {
          const result = await linearClient.client.rawRequest(mutation, variables);
          
          if (!(result.data as any)?.commentCreate?.success) {
            throw new Error("Failed to create comment");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify((result.data as any).commentCreate, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error creating comment:", error);
          throw new Error(`Failed to create comment: ${error.message}`);
        }
      }

      case "list_labels": {
        const args = request.params.arguments as unknown as ListLabelsArgs;
        const filter: Record<string, any> = {};
        if (args?.teamId) filter.team = { id: { eq: args.teamId } };

        const query = `
          query Labels($first: Int, $filter: IssueFilterInput) {
            issueLabels(first: $first, filter: $filter) {
              nodes {
                id
                name
                color
                description
                team {
                  id
                  name
                  key
                }
                creator {
                  id
                  name
                }
                createdAt
                updatedAt
              }
            }
          }
        `;

        const variables = {
          first: args?.first ?? 50,
          filter,
        };

        try {
          const result = await linearClient.client.rawRequest(query, variables);
          const labels = (result.data as any)?.issueLabels?.nodes || [];

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(labels, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error listing labels:", error);
          throw new Error(`Failed to list labels: ${error.message}`);
        }
      }

      case "create_label": {
        const args = request.params.arguments as unknown as CreateLabelArgs;
        if (!args?.name) {
          throw new Error("Label name is required");
        }
        if (!args?.teamId) {
          throw new Error("Team ID is required");
        }

        const mutation = `
          mutation LabelCreate($input: IssueLabelCreateInput!) {
            issueLabelCreate(input: $input) {
              success
              issueLabel {
                id
                name
                color
                description
                team {
                  id
                  name
                }
                creator {
                  id
                  name
                }
                createdAt
              }
            }
          }
        `;

        const variables = {
          input: {
            name: args.name,
            color: args.color,
            description: args.description,
            teamId: args.teamId,
          },
        };

        try {
          const result = await linearClient.client.rawRequest(mutation, variables);
          
          if (!(result.data as any)?.issueLabelCreate?.success) {
            throw new Error("Failed to create label");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify((result.data as any).issueLabelCreate, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error creating label:", error);
          throw new Error(`Failed to create label: ${error.message}`);
        }
      }

      case "update_label": {
        const args = request.params.arguments as unknown as UpdateLabelArgs;
        if (!args?.labelId) {
          throw new Error("Label ID is required");
        }

        const mutation = `
          mutation LabelUpdate($id: String!, $input: IssueLabelUpdateInput!) {
            issueLabelUpdate(id: $id, input: $input) {
              success
              issueLabel {
                id
                name
                color
                description
                updatedAt
              }
            }
          }
        `;

        const variables = {
          id: args.labelId,
          input: {
            name: args.name,
            color: args.color,
            description: args.description,
          },
        };

        try {
          const result = await linearClient.client.rawRequest(mutation, variables);
          
          if (!(result.data as any)?.issueLabelUpdate?.success) {
            throw new Error("Failed to update label");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify((result.data as any).issueLabelUpdate, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error updating label:", error);
          throw new Error(`Failed to update label: ${error.message}`);
        }
      }

      case "delete_label": {
        const args = request.params.arguments as unknown as DeleteLabelArgs;
        if (!args?.labelId) {
          throw new Error("Label ID is required");
        }

        const mutation = `
          mutation LabelDelete($id: String!) {
            issueLabelDelete(id: $id) {
              success
            }
          }
        `;

        const variables = {
          id: args.labelId,
        };

        try {
          const result = await linearClient.client.rawRequest(mutation, variables);
          
          if (!(result.data as any)?.issueLabelDelete?.success) {
            throw new Error("Failed to delete label");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  message: `Label ${args.labelId} deleted successfully`,
                }, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error deleting label:", error);
          throw new Error(`Failed to delete label: ${error.message}`);
        }
      }

      case "list_users": {
        const args = request.params.arguments as unknown as ListUsersArgs;
        
        const users = await linearClient.users({
          first: args?.first ?? 50,
        });
        
        const formattedUsers = await Promise.all(
          users.nodes.map(async (user) => {
            const avatar = user.avatarUrl;
            const isAdmin = user.admin;
            const isActive = user.active;
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              displayName: user.displayName,
              avatar: avatar,
              admin: isAdmin,
              active: isActive,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            };
          })
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(formattedUsers, null, 2),
            },
          ],
        };
      }

      case "get_user": {
        const args = request.params.arguments as unknown as GetUserArgs;
        if (!args?.userId) {
          throw new Error("User ID is required");
        }

        const user = await linearClient.user(args.userId);
        if (!user) {
          throw new Error(`User ${args.userId} not found`);
        }
        
        // Fetch additional details with a custom GraphQL query
        const query = `
          query User($id: String!) {
            user(id: $id) {
              id
              name
              displayName
              email
              avatarUrl
              active
              admin
              createdAt
              updatedAt
              lastSeen
              teams {
                nodes {
                  id
                  name
                  key
                }
              }
              organization {
                id
                name
              }
            }
          }
        `;
        
        const variables = {
          id: args.userId,
        };
        
        try {
          const result = await linearClient.client.rawRequest(query, variables);
          const userData = (result.data as any)?.user;
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(userData, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error fetching user details:", error);
          
          // Fallback to basic user information if detailed query fails
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  displayName: user.displayName,
                  active: user.active,
                  admin: user.admin,
                  createdAt: user.createdAt,
                }, null, 2),
              },
            ],
          };
        }
      }

      case "get_current_user": {
        try {
          // Get the viewer (currently authenticated user)
          const viewer = await linearClient.viewer;
          
          // Fetch additional details with a custom GraphQL query
          const query = `
            query {
              viewer {
                id
                name
                displayName
                email
                avatarUrl
                active
                admin
                createdAt
                updatedAt
                lastSeen
                teams {
                  nodes {
                    id
                    name
                    key
                  }
                }
                organization {
                  id
                  name
                }
              }
            }
          `;
          
          try {
            const result = await linearClient.client.rawRequest(query);
            const userData = (result.data as any)?.viewer;
            
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(userData, null, 2),
                },
              ],
            };
          } catch (error: any) {
            console.error("Error fetching current user details:", error);
            
            // Fallback to basic user information if detailed query fails
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    id: viewer.id,
                    name: viewer.name,
                    email: viewer.email,
                    displayName: viewer.displayName,
                    active: viewer.active,
                    admin: viewer.admin,
                    createdAt: viewer.createdAt,
                  }, null, 2),
                },
              ],
            };
          }
        } catch (error: any) {
          console.error("Error fetching current user:", error);
          throw new Error(`Failed to fetch current user: ${error.message}`);
        }
      }

      case "create_team": {
        const args = request.params.arguments as unknown as CreateTeamArgs;
        if (!args?.name || !args?.key) {
          throw new Error("Name and key are required");
        }

        const team = await linearClient.createTeam({
          name: args.name,
          key: args.key,
          description: args.description,
          icon: args.icon,
          color: args.color,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(team, null, 2),
            },
          ],
        };
      }

      case "update_team": {
        const args = request.params.arguments as unknown as UpdateTeamArgs;
        if (!args?.teamId) {
          throw new Error("Team ID is required");
        }

        const team = await linearClient.team(args.teamId);
        if (!team) {
          throw new Error(`Team ${args.teamId} not found`);
        }

        const updatedTeam = await team.update({
          name: args.name,
          key: args.key,
          description: args.description,
          icon: args.icon,
          color: args.color,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(updatedTeam, null, 2),
            },
          ],
        };
      }

      case "delete_team": {
        const args = request.params.arguments as unknown as DeleteTeamArgs;
        if (!args?.teamId) {
          throw new Error("Team ID is required");
        }

        const team = await linearClient.team(args.teamId);
        if (!team) {
          throw new Error(`Team ${args.teamId} not found`);
        }

        const shouldArchive = args.archive !== false; // Default to true if not specified

        if (shouldArchive) {
          // Currently, the Linear API doesn't support archiving teams through their GraphQL API
          // Return information about this limitation
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  message: "Team archiving is not currently supported through the API. Teams can only be deleted. To archive a team, please use the Linear web interface.",
                  teamId: args.teamId,
                  teamName: team.name,
                }, null, 2),
              },
            ],
          };
        } else {
          // Permanently delete the team
          const result = await team.delete();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  message: `Team ${args.teamId} has been permanently deleted`,
                  result,
                }, null, 2),
              },
            ],
          };
        }
      }

      case "create_project": {
        const args = request.params.arguments as unknown as CreateProjectArgs;
        if (!args?.name || !args?.teamIds) {
          throw new Error("Name and teamIds are required");
        }

        // Use GraphQL directly as the SDK has some limitations
        const mutation = `
          mutation ProjectCreate($input: ProjectCreateInput!) {
            projectCreate(input: $input) {
              success
              project {
                id
                name
                description
                state
                color
                icon
                createdAt
                updatedAt
                teams {
                  nodes {
                    id
                    name
                    key
                  }
                }
              }
            }
          }
        `;

        const variables = {
          input: {
            name: args.name,
            description: args.description,
            teamIds: args.teamIds,
            state: args.state,
            icon: args.icon,
            color: args.color,
          },
        };

        try {
          const result = await linearClient.client.rawRequest(mutation, variables);
          
          if (!(result.data as any)?.projectCreate?.success) {
            throw new Error("Failed to create project");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify((result.data as any).projectCreate, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error creating project:", error);
          throw new Error(`Failed to create project: ${error.message}`);
        }
      }

      case "update_project": {
        const args = request.params.arguments as unknown as UpdateProjectArgs;
        if (!args?.projectId) {
          throw new Error("Project ID is required");
        }

        // Use GraphQL directly for project updates
        const mutation = `
          mutation ProjectUpdate($id: String!, $input: ProjectUpdateInput!) {
            projectUpdate(id: $id, input: $input) {
              success
              project {
                id
                name
                description
                state
                color
                icon
                createdAt
                updatedAt
              }
            }
          }
        `;

        const variables = {
          id: args.projectId,
          input: {
            name: args.name,
            description: args.description,
            state: args.state,
            icon: args.icon,
            color: args.color,
          },
        };

        try {
          const result = await linearClient.client.rawRequest(mutation, variables);
          
          if (!(result.data as any)?.projectUpdate?.success) {
            throw new Error("Failed to update project");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify((result.data as any).projectUpdate, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error updating project:", error);
          throw new Error(`Failed to update project: ${error.message}`);
        }
      }

      case "get_project": {
        const args = request.params.arguments as unknown as GetProjectArgs;
        if (!args?.projectId) {
          throw new Error("Project ID is required");
        }

        // Use GraphQL directly to get all the project details
        const query = `
          query Project($id: String!) {
            project(id: $id) {
              id
              name
              description
              state
              color
              icon
              createdAt
              updatedAt
              teams {
                nodes {
                  id
                  name
                  key
                  description
                  color
                  icon
                }
              }
              issues {
                nodes {
                  id
                  identifier
                  title
                  state {
                    name
                  }
                }
              }
              url
            }
          }
        `;

        const variables = {
          id: args.projectId,
        };

        try {
          const result = await linearClient.client.rawRequest(query, variables);
          const projectData = (result.data as any)?.project;
          
          if (!projectData) {
            throw new Error(`Project ${args.projectId} not found`);
          }

          // Format team information for easier consumption
          const teamData = projectData.teams.nodes.map((team: any) => ({
            id: team.id,
            name: team.name,
            key: team.key,
            description: team.description || "",
            icon: team.icon || "",
            color: team.color || "",
          }));

          // Format the project details
          const projectDetails = {
            ...projectData,
            teamCount: teamData.length,
            teams: teamData,
          };

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(projectDetails, null, 2),
              },
            ],
          };
        } catch (error: any) {
          console.error("Error fetching project details:", error);
          throw new Error(`Failed to fetch project details: ${error.message}`);
        }
      }

      case "list_project_milestones": {
        const args = request.params.arguments as unknown as ListProjectMilestonesArgs;
        if (!args?.projectId) {
          throw new Error("Project ID is required");
        }

        const query = `
          query ProjectMilestones($projectId: String!, $first: Int) {
            project(id: $projectId) {
              milestones(first: $first) {
                nodes {
                  id
                  name
                  description
                  targetDate
                  sortOrder
                  createdAt
                  updatedAt
                  issues {
                    nodes {
                      id
                      title
                      state {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const variables = {
          projectId: args.projectId,
          first: args?.first ?? 50,
        };

        try {
          const result = await linearClient.client.rawRequest(query, variables);
          const milestones = (result.data as any)?.project?.milestones?.nodes || [];

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(milestones, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new Error(`Failed to list project milestones: ${error.message}`);
        }
      }

      case "create_project_milestone": {
        const args = request.params.arguments as unknown as CreateProjectMilestoneArgs;
        if (!args?.projectId || !args?.name) {
          throw new Error("Project ID and name are required");
        }

        const mutation = `
          mutation CreateProjectMilestone($input: ProjectMilestoneCreateInput!) {
            projectMilestoneCreate(input: $input) {
              success
              projectMilestone {
                id
                name
                description
                targetDate
                sortOrder
                createdAt
                updatedAt
              }
            }
          }
        `;

        const variables = {
          input: {
            projectId: args.projectId,
            name: args.name,
            description: args.description,
            targetDate: args.targetDate,
            sortOrder: args.sortOrder,
          },
        };

        try {
          const result = await linearClient.client.rawRequest(mutation, variables);
          
          if (!(result.data as any)?.projectMilestoneCreate?.success) {
            throw new Error("Failed to create project milestone");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify((result.data as any).projectMilestoneCreate, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new Error(`Failed to create project milestone: ${error.message}`);
        }
      }

      case "update_project_milestone": {
        const args = request.params.arguments as unknown as UpdateProjectMilestoneArgs;
        if (!args?.milestoneId) {
          throw new Error("Milestone ID is required");
        }

        const mutation = `
          mutation UpdateProjectMilestone($id: String!, $input: ProjectMilestoneUpdateInput!) {
            projectMilestoneUpdate(id: $id, input: $input) {
              success
              projectMilestone {
                id
                name
                description
                targetDate
                sortOrder
                updatedAt
              }
            }
          }
        `;

        const variables = {
          id: args.milestoneId,
          input: {
            name: args.name,
            description: args.description,
            targetDate: args.targetDate,
            sortOrder: args.sortOrder,
          },
        };

        try {
          const result = await linearClient.client.rawRequest(mutation, variables);
          
          if (!(result.data as any)?.projectMilestoneUpdate?.success) {
            throw new Error("Failed to update project milestone");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify((result.data as any).projectMilestoneUpdate, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new Error(`Failed to update project milestone: ${error.message}`);
        }
      }

      case "delete_project_milestone": {
        const args = request.params.arguments as unknown as DeleteProjectMilestoneArgs;
        if (!args?.milestoneId) {
          throw new Error("Milestone ID is required");
        }

        const mutation = `
          mutation DeleteProjectMilestone($id: String!) {
            projectMilestoneDelete(id: $id) {
              success
            }
          }
        `;

        const variables = {
          id: args.milestoneId,
        };

        try {
          const result = await linearClient.client.rawRequest(mutation, variables);
          
          if (!(result.data as any)?.projectMilestoneDelete?.success) {
            throw new Error("Failed to delete project milestone");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  message: `Milestone ${args.milestoneId} deleted successfully`,
                }, null, 2),
              },
            ],
          };
        } catch (error: any) {
          throw new Error(`Failed to delete project milestone: ${error.message}`);
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
    }
  } catch (error: any) {
    console.error("Linear API Error:", error);
    return {
      content: [
        {
          type: "text",
          text: `Linear API error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Linear MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
