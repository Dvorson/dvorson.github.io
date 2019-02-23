'use strict'

const serve = require('koa-static')
const Koa = require('koa')
const mount = require('koa-mount')
const path = require('path')
const app = new Koa()
const port = 8080

app.use(serve(path.resolve(__dirname, '../dist')))
app.use(mount('/img', serve(path.resolve(__dirname, '../img'))))

app.listen(port)

console.log('listening on port ' + port)
