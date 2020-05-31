const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults({
  static: './public'
})

server.use(middlewares)
server.use(router)
server.listen(9072, () => {
  console.log('json server server started on 9072')
})
