#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

// ANSI colors for terminal output
const COLORS = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to Cursor config directory and MCP config file
const homedir = os.homedir();
const cursorConfigDir = path.join(homedir, '.cursor');
const mcpConfigFile = path.join(cursorConfigDir, 'mcp.json');

/**
 * Print colorized message
 */
function printMessage(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

/**
 * Ask for user input
 */
async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Ask for hidden input (like password)
 */
async function askHiddenQuestion(question) {
  process.stdout.write(question);
  
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    
    let password = '';
    
    stdin.on('data', function handler(ch) {
      ch = ch.toString('utf8');
      
      switch (ch) {
        case "\n": 
        case "\r":
        case "\u0004": // Ctrl+D
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', handler);
          process.stdout.write('\n');
          resolve(password);
          break;
        case "\u0003": // Ctrl+C
          process.exit();
          break;
        case "\u007F": // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b'); // Erase character from terminal
          }
          break;
        default:
          password += ch;
          process.stdout.write('*');
          break;
      }
    });
  });
}

/**
 * Setup Cursor configuration
 */
async function setupCursor(apiKey) {
  // Ensure cursor config directory exists
  try {
    await mkdir(cursorConfigDir, { recursive: true });
    printMessage('✓ Cursor configuration directory created', 'green');
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }

  // Check if mcp.json already exists
  let mcpConfig = { mcpServers: {} };
  try {
    const fileContent = await readFile(mcpConfigFile, 'utf8');
    try {
      mcpConfig = JSON.parse(fileContent);
      printMessage('✓ Existing Cursor MCP configuration found', 'green');
      
      // Create backup of existing config
      await writeFile(`${mcpConfigFile}.backup`, fileContent);
      printMessage('✓ Backup of existing configuration created', 'green');
    } catch (parseErr) {
      printMessage('⚠️ Existing configuration file is invalid JSON. Creating new one.', 'yellow');
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
    printMessage('Creating new Cursor MCP configuration file...', 'yellow');
  }

  // Ensure mcpServers object exists
  if (!mcpConfig.mcpServers) {
    mcpConfig.mcpServers = {};
  }

  // Add or update agency-linear configuration
  mcpConfig.mcpServers['agency-linear'] = {
    command: 'npx',
    args: ['agency-linear'],
    env: {
      LINEAR_API_KEY: apiKey
    },
    disabled: false,
    alwaysAllow: []
  };

  // Write updated configuration
  await writeFile(mcpConfigFile, JSON.stringify(mcpConfig, null, 2));
  printMessage('✓ Cursor MCP configuration updated successfully', 'green');
}

/**
 * Main function
 */
async function main() {
  printMessage('\n🚀 Agency Linear MCP Setup', 'bold');
  printMessage('This script will configure Cursor to use agency-linear MCP\n');

  // Ask for Linear API key
  printMessage('You need a Linear API key to use this plugin.', 'yellow');
  printMessage('You can get one at https://linear.app/settings/api\n');
  
  let apiKey = '';
  while (!apiKey) {
    apiKey = await askHiddenQuestion('Enter your Linear API key: ');
    if (!apiKey) {
      printMessage('API key cannot be empty. Please try again.', 'red');
    }
  }
  
  try {
    await setupCursor(apiKey);
    printMessage('\n✨ Setup complete!', 'bold');
    printMessage('You can now use agency-linear MCP in Cursor.');
    printMessage('If Cursor is currently running, please restart it for changes to take effect.');
  } catch (err) {
    printMessage(`\n❌ Error: ${err.message}`, 'red');
    printMessage('Setup failed. Please try again or configure manually.');
    process.exit(1);
  }

  rl.close();
}

// Run the setup
main().catch(err => {
  printMessage(`\nUnexpected error: ${err.message}`, 'red');
  process.exit(1);
}); 