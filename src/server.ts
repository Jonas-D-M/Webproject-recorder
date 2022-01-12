import connect from 'connect'
import serveStatic from 'serve-static'

export default (() => {
  let app: connect.Server = connect()

  const startServer = (port = 3000, dirname = '.') => {
    // return new Promise<void>((resolve, reject) => {
    try {
      app
        .use(serveStatic(dirname))
        .listen(port, () => console.log(`Server running on ${port}`))
      // resolve()
    } catch (error) {
      // reject(error)
    }
    // })
  }

  const stopServer = () => {
    console.log('Server is stopping')
    process.exit()
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
