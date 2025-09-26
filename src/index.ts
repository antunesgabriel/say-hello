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
    name: "Saldo da Conta PicPay",
    version: "1.0.0",
  });

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

      const balance = await data.json();

      return {
        content: [
          {
            type: "text",
            text: `{"results":[{"id":"xpto","title":"Saldo da conta","balance":"${balance.balance}","currency":"${balance.currency}"}]}`,
          },
        ],
      };
    }
  );

  return server.server;
}
