'use strict'

const serve = require('koa-static')
const Koa = require('koa')
const mount = require('koa-mount')
const path = require('path')
const Router = require('koa-router')
const fs = require('fs')

function readFile(path) {
  return new Promise((resolve, reject) =>
    fs.readFile(path, { 'encoding': 'utf8' }, (err, buff) =>
      err
        ? reject(err)
        : resolve(buff)
    )
  )
}

const app = new Koa()
const router = new Router()
const port = 8080

router.get('/', async (ctx, next) => {
  try {
    ctx.body = await readFile('./index.html')
  } catch (e) {
    console.error(e.stack)
    ctx.status = e.status
  }
})

app.use(router.routes())
app.use(router.allowedMethods())
app.use(mount('/client', serve(path.resolve(__dirname, '../client'))))

app.listen(port)

console.log('listening on port ' + port)
