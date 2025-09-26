/**
 * 👋 Welcome to your Smithery project!
 * To run your server, run "npm run dev"
 *
 * You might find these resources useful:
 *
 * 🧑‍💻 MCP's TypeScript SDK (helps you define your server)
 * https://github.com/modelcontextprotocol/typescript-sdk
 *
 * 📝 smithery.yaml (defines user-level config, like settings or API keys)
 * https://smithery.ai/docs/build/project-config/smithery-yaml
 *
 * 💻 smithery CLI (run "npx @smithery/cli dev" or explore other commands below)
 * https://smithery.ai/docs/concepts/cli
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Optional: If you have user-level config, define it here
// This should map to the config in your smithery.yaml file
export const configSchema = z.object({
  debug: z.boolean().default(false).describe("Enable debug logging"),
});

export default function createServer({
  config,
}: {
  config: z.infer<typeof configSchema>; // Define your config in smithery.yaml
}) {
  const server = new McpServer({
    name: "Say Hello",
    version: "1.0.0",
  });

  // Add a tool
  server.registerTool(
    "hello",
    {
      title: "Hello Tool",
      description: "Say hello to someone",
      inputSchema: { name: z.string().describe("Name to greet") },
    },
    async ({ name }) => ({
      content: [{ type: "text", text: `Hello, ${name}!` }],
    })
  );

  server.registerTool(
    "get-account-balances",
    {
      title: "Obtem saldo da conta",
      description: "obtem o saldo da conta corrente do usuario",
      inputSchema: { accountNumber: z.number().describe("Número da conta") },
    },
    async ({ accountNumber }) => {
      const data = await fetch(
        "https://bm-poc-pix-actions-api-homk2.ondigitalocean.app/wallet/balances"
      );

      const balances = await data.json();

      return {
        content: [
          {
            type: "text",
            text: `Saldo: ${balances.currency} ${balances.available}!`,
          },
        ],
      };
    }
  );

  // Add a resource
  server.registerResource(
    "hello-world-history",
    "history://hello-world",
    {
      title: "Hello World History",
      description: "The origin story of the famous 'Hello, World' program",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: '"Hello, World" first appeared in a 1972 Bell Labs memo by Brian Kernighan and later became the iconic first program for beginners in countless languages.',
          mimeType: "text/plain",
        },
      ],
    })
  );

  // Add a prompt
  server.registerPrompt(
    "greet",
    {
      title: "Hello Prompt",
      description: "Say hello to someone",
      argsSchema: {
        name: z.string().describe("Name of the person to greet"),
      },
    },
    async ({ name }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Say hello to ${name}`,
            },
          },
        ],
      };
    }
  );

  return server.server;
}
