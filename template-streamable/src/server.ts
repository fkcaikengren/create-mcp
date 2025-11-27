import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";
import "dotenv/config";
import { seniverseApi } from "./core/index.js";

export class MyServer {
  private mcpServer: McpServer;
  private app: express.Express
  constructor() {
    this.mcpServer = new McpServer({
      name: "weather",
      version: "0.0.1",
    });

    // Set up Express and HTTP transport
    this.app = express();
    this.app.use(express.json());

    this.app.use('/mcp', async (req: express.Request, res: express.Response) => {
        // Create a new transport for each request to prevent request ID collisions
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true
        });

        res.on('close', () => {
            transport.close();
        });

        await this.mcpServer.connect(transport);
        await transport.handleRequest(req, res, req.body);
    });

  }

  /**
   * 在端口运行Server, 通过HTTP stream传输数据
   */
  async run(): Promise<void> {
    const port = parseInt(process.env.PORT || '3000');
    this.app.listen(port, () => {
        console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
    }).on('error', error => {
        console.error('Server error:', error);
        process.exit(1);
    });
    
  }

  /**
   * 初始化，注册工具
   */
  async init(): Promise<void> {
    // Register weather tool
    this.mcpServer.registerTool(
      "get_weather_now",
      {
        title: "Get Weather Now",
        description: "Get current weather for a location (city name)",
        inputSchema: {
          location: z.string().describe("Location name or city (e.g. beijing, shanghai, new york, tokyo)")
        }
      },
      async ({ location }) => {
        
        const weatherData = await seniverseApi.getWeatherNow(location);
        if (!weatherData || !weatherData.results || weatherData.results.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to retrieve weather data for location: ${location}. Please check the location name and try again.`,
              },
            ],
          };
        }

        const result = weatherData.results[0];
        const weatherText = `Weather for ${result.location.name}, ${result.location.country}:\n` +
                            `Condition: ${result.now.text}\n` +
                            `Temperature: ${result.now.temperature}°C\n` +
                            `Last Update: ${result.last_update}`;
        return {
          content: [
            {
              type: "text",
              text: weatherText,
            },
          ],
        };
      },
    );
  }
}
