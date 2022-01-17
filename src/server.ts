import fs from 'fs'
import http from 'http'
import nodestatic from 'node-static'

export default (() => {
  // let file = new StaticServer(__dirname)
  let server: http.Server

  const startServer = (port = 3000, dirname?: string) => {
    const file = new nodestatic.Server(`${process.cwd()}${dirname}`)
    server = http
      .createServer(function (req, res) {
        file.serve(req, res)
      })
      .listen(port)
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
