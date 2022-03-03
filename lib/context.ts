import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Stream } from 'node:stream';

// 使用 WHATWG URL API 替代 url/qs 内建模块

function isStream (stream: any): stream is Stream {
  return typeof stream.pipe === 'function'
}

const CONTENT_TYPE = {
  JSON: 'application/json; charset=utf-8',
  HTML: 'application/html; charset=utf-8',
  PLAIN: 'text/plain; charset=utf-8',
  OCTET: 'application/octet-stream'
}

export default class Context {
  req: IncomingMessage
  res: ServerResponse
  private urlCache: URL | undefined
  private body: string | object | Stream | null;

  constructor (req: IncomingMessage, res: ServerResponse) {
    this.req = req
    this.res = res
    this.body = null
  }

  // method、url、query 皆是从 req 中获取，尽量只做可读属性
  get method () {
    return this.req.method
  }

  get url () {
    // 此处对 URL 进行缓存，无需每次都解析 URL
    if (this.urlCache) {
      return this.urlCache
    }
    // TODO: 此处 protocol、host 需要手动解析
    this.urlCache = new URL(`http://localhost'${this.req.url}`)
    return this.urlCache
  }

  get query () {
    return this.url.searchParams
  }

  get path () {
    return this.url.pathname
  }

  get requestType () {
    const contentType = this.req.headers['content-type']
    if (!contentType) {
      return null
    }
    return contentType.split(';', 1)[0]
  }

  // 以下解释从 res 中获取
  get status () {
    return this.res.statusCode
  }

  set status (code: number) {
    this.res.statusCode = code
  }
  
  set responseType (text: string) {
    this.res.setHeader('Content-Type', text)
  }

  set responseBody (body: any) {
    this.body = body
  }

  sendResponse () {
    const { body, res } = this

    const hasContentType = Boolean(this.res.getHeader('content-type'))

    if (body === undefined || body === null) {
      // TODO: 处理 204/304
      res.end(null)
    } else if (isStream(body)) {
      if (!hasContentType) {
        this.responseType = CONTENT_TYPE.OCTET
      }
      // TODO: 处理 eos
      body.pipe(res)

    } else if (typeof body === 'object') {
      if (!hasContentType) {
        this.responseType = CONTENT_TYPE.JSON
      }
      res.end(JSON.stringify(body))
    } else if (typeof body === 'string') {
      if (!hasContentType) {
        this.responseType = CONTENT_TYPE.PLAIN
      }
      res.end(body)
    }
  }
}
