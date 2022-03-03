import Application from '..'
import stream from 'node:stream'
import type Context from '../lib/context'

const app = new Application()

// 任务一：能够处理字符串，并能够正常显示中文
const f1 = (ctx: Context) => {
  ctx.responseBody = 'hello, 山月'
}

// 任务二：能够处理 JSON，并返回相应的 ContentType
const f2 = (ctx: Context) => {
  ctx.responseBody = { hello: 'hello, 山月' }
}

// 任务三：能够处理 stream
const f3 = (ctx: Context) => {
  ctx.responseBody = stream.Readable.from('hello, world')
}

// 任务四: 获取 path/query
const f4 = (ctx: Context) => {
  const a = ctx.query.get('a')
  const b = ctx.query.get('b')
  const c = ctx.query.get('c')
  const query = ctx.query.values()
  console.log(a, b, c, query)
}

app.use(f4)

app.listen(4000, () => console.log('Listening 4000...'))
