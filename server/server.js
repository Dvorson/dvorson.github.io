'use strict'

const serve = require('koa-static');
const Koa = require('koa');
const path = require('path');
const app = new Koa();
const port = 8080;

app.use(serve(path.resolve(__dirname, '../dist')));

app.listen(port);

console.log('listening on port ' + port);