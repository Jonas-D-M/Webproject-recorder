import http from 'http'
import nodestatic from 'node-static'
import { findNPMCommands } from './utils'
import { promisify } from 'util'
import { spawn, exec as execute } from 'child_process'
const exec = promisify(execute)

export default (() => {
  let server: http.Server

  const startNodeServer = (buildCMD: string, startCMD: string) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        console.info('Starting node server in background')
        process.chdir('./test2')
        spawn('npm', ['run', 'start'], {
          stdio: 'ignore', // piping all stdio to /dev/null
          detached: true,
        }).unref()
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }

  const stopNodeServer = () => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        console.info('Stopping node server...')
        await exec('fuser -k 3000/tcp')
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  const startStaticServer = (dirname: string, port = 3000) => {
    return new Promise<void>((resolve, reject) => {
      const file = new nodestatic.Server(dirname)
      server = http
        .createServer(function (req, res) {
          file.serve(req, res)
        })
        .listen(port)
      resolve()
    })
  }

  const stopStaticServer = () => {
    console.log('Server is stopping')
    server.close()
  }

  const startServer = async (isStatic: boolean, projectDir: string) => {
    console.info('Server is starting')

    if (isStatic) {
      await startStaticServer(projectDir)
    } else {
      const { buildCMD, startCMD } = findNPMCommands(
        `${projectDir}/package.json`,
      )
      await startNodeServer(buildCMD, startCMD)
    }
  }

  const stopServer = async (isStatic: boolean) => {
    if (isStatic) {
      stopStaticServer()
    } else {
      await stopNodeServer()
    }
  }

  return {
    startServer,
    stopServer,
  }
})()
