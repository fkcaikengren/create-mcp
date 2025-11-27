import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import path from "node:path";
import { countFiles } from "./core/fileCount.js";

export class MyServer {
  private mcpServer: McpServer;

  constructor() {
    this.mcpServer = new McpServer({
      name: "mcp-file-counter",
      version: "0.1.0",
    });

    // Error handling
    process.on("SIGINT", async () => {
      await this.mcpServer.close();
      process.exit(0);
    });
  }

  /**
   * Initialize and register tools
   */
  async init(): Promise<void> {
    this.mcpServer.registerTool(
      "count_files",
      {
        description: "Count files under a directory",
        inputSchema: {
          path: z.string().default(".").describe("Path to the directory"),
          ignore: z
            .array(z.string())
            .default(["node_modules", ".git", "dist"])
            .describe("List of patterns to ignore"),
        },
      },
      async ({ path: rootArg, ignore: ignoreArg }) => {
        const root = path.resolve(process.cwd(), rootArg);
        const total = await countFiles(root, ignoreArg);
        return {
          content: [
            {
              type: "text",
              text: String(total),
            },
          ],
        };
      }
    );
  }

  /**
   * Run the server on stdio transport
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.mcpServer.connect(transport);
    console.error("MCP File Counter Server running on stdio");

    // 监听 stdin 输入，可以在inspector面板的"notifications/message"中看到（作为debug用）
    process.stdin.on("data", async (data) => {
      const input = data.toString().trim();
      console.error(input);
    });
  }
}
