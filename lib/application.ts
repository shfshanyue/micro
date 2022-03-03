import http, { IncomingMessage, ServerResponse } from 'node:http'
import Context from './context'

import type { Server } from 'node:http'

export default class Application {
  private handleRequest: (ctx: Context) => void | Promise<void>;

  constructor () {
    this.handleRequest = (ctx) => {
      ctx.responseBody = 'hello, micro.'
    }
  }

  listen(...args: Parameters<typeof Server.prototype.listen>) {
    // 在 listen 中处理请求并监听端口号
    const server = http.createServer(this.callback())
    server.listen(...args)
  }

  // 在 app.callback() 将返回 Node HTTP API 标准的 handleRequest 函数，方便测试
  callback() {
    return async (req: IncomingMessage, res: ServerResponse) => {
      const context = new Context(req, res)
      await this.handleRequest(context) 
      context.sendResponse()
    }
  }

  use (handleRequest: (ctx: Context) => void) {
    this.handleRequest = handleRequest
  }
}
