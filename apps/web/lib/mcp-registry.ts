/**
 * MCP Server Registry — Dependency Injection for tools
 * Centralizes all MCP server instantiation and tool registration
 * Enables easy mocking in tests
 */

import type { Tool } from '@anthropic-ai/sdk/resources/messages';

interface MCPServer {
  name: string;
  description: string;
  tools: Tool[];
}

interface MCPContext {
  callTool(serverName: string, toolName: string, input: Record<string, unknown>): Promise<unknown>;
  listServers(): MCPServer[];
  listTools(serverName: string): Tool[];
}

class MCPRegistry {
  private servers: Map<string, MCPServer> = new Map();
  private toolHandlers: Map<string, Map<string, Function>> = new Map();

  register(server: MCPServer, toolHandlers: Record<string, Function>): void {
    if (this.servers.has(server.name)) {
      throw new Error(`MCP server "${server.name}" already registered`);
    }

    this.servers.set(server.name, server);
    const handlers = new Map<string, Function>();
    for (const [toolName, handler] of Object.entries(toolHandlers)) {
      handlers.set(toolName, handler);
    }
    this.toolHandlers.set(server.name, handlers);
  }

  async callTool(
    serverName: string,
    toolName: string,
    input: Record<string, unknown>
  ): Promise<unknown> {
    const handlers = this.toolHandlers.get(serverName);
    if (!handlers) {
      throw new Error(`MCP server "${serverName}" not registered`);
    }

    const handler = handlers.get(toolName);
    if (!handler) {
      throw new Error(`Tool "${toolName}" not found in server "${serverName}"`);
    }

    return await handler(input);
  }

  listServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  listTools(serverName: string): Tool[] {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`MCP server "${serverName}" not found`);
    }
    return server.tools;
  }

  getContext(): MCPContext {
    return {
      callTool: (serverName, toolName, input) =>
        this.callTool(serverName, toolName, input),
      listServers: () => this.listServers(),
      listTools: (serverName) => this.listTools(serverName),
    };
  }
}

// Singleton instance
export const mcpRegistry = new MCPRegistry();

// Register all MCP servers (to be called on app initialization)
export function initializeMCPServers(): void {
  // Import and register each MCP server
  // Example pattern:
  // mcpRegistry.register(whatsappMessagingServer, whatsappHandlers);
  // mcpRegistry.register(sierraDealsServer, dealsHandlers);
  // mcpRegistry.register(stripePaymentsServer, stripeHandlers);
  // mcpRegistry.register(docusignSigningServer, docusignHandlers);
  // mcpRegistry.register(stage9OrchestrationServer, stage9Handlers);

  console.log('✅ MCP servers initialized');
}

export type { MCPContext, MCPServer };
