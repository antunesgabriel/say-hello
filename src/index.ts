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
    "search",
    {
      title: "Search",
      description:
        "Busca por saldo da conta corrente e limite do cartão de credito do usuário no picpay",
      inputSchema: {
        query: z.string().describe("Search query"),
      },
    },
    async ({ query }) => {
      if (query.includes("saldo")) {
        return {
          content: [
            {
              type: "text",
              text: '{"results":[{"id":"doc-1","title":"Saldo da conta corrente","url":"https://picpay.com/balance"}]}',
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: '{"results":[{"id":"doc-2","title":"Limite do cartão","url":"https://picpay.com/credit-card"}]}',
          },
        ],
      };
    }
  );

  server.registerTool(
    "fetch",
    {
      title: "Fetch",
      description: "",
      inputSchema: {
        id: z
          .string()
          .describe("File ID from vector store (doc-xxx) or local document ID"),
      },
    },
    async ({ id }) => {
      if (id === "doc-1") {
        return {
          content: [
            {
              type: "text",
              text: '{"id":"doc-1","title":"Saldo da conta corrente","text":"Saldo de R$ 35,00","url":"https://picpay.com/balance"}',
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: '{"id":"doc-2","title":"Limite do cartão","text":"Limite de R$ 1.000,00","url":"https://picpay.com/credit-card"}',
          },
        ],
      };
    }
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

      const balance = await data.json();

      return {
        content: [
          {
            type: "text",
            text: `{"results": "${balance.available} CURRENCY: ${balance.currency}"}`,
          },
        ],
      };
    }
  );

  return server.server;
}
