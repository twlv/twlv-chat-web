const http = require('http');
const Bundle = require('bono');

const PORT = process.env.PORT || 8080;

const app = new Bundle();
app.use(require('koa-static')('./docs'));

const server = http.createServer(app.callback());
server.listen(PORT);
