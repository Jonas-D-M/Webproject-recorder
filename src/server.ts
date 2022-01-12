import connect from 'connect'
import serveStatic from 'serve-static'

export default (() => {
  const initServer = (port = 3000, dirname = '.') => {
    connect()
      .use(serveStatic(dirname))
      .listen(port, () => console.log(`Server running on ${port}`))
  }

  const test = () => {
    console.log('this is a message from the server.ts module')
  }

  return {
    initServer,
    test,
  }
})()
