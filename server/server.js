'use strict'

const serve = require('koa-static');
const koa = require('koa');
const path = require('path');
const app = koa();
const port = 3000;

app.use(serve(path.resolve(__dirname, '../')));

app.listen(port);

console.log('listening on port ' + port);