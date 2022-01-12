import fs from 'fs'
import { createServer, Server } from 'http'
import { Server as StaticServer } from 'node-static'

export default (() => {
  let file = new StaticServer(__dirname)
  let server: Server

  const startServer = (port = 3000, dirname = '.') => {
    server = createServer(function (req, res) {
      file.serve(req, res)
    }).listen(port)
    console.log(`Server is serving on port ${port}`)
  }

  const stopServer = () => {
    console.log('Server is stopping')
    server.close()
  }

  const test = () => {
    console.log('this is a message from the server.ts module')
    console.log('')
    console.log('another one')
  }

  return {
    startServer,
    test,
    stopServer,
  }
})()
