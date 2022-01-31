import pm2 from 'pm2'
import fs from 'fs'
import http from 'http'
import nodestatic from 'node-static'
import { findNPMCommands } from './utils'

export default (() => {
  const startPMServer = async (buildCMD: string, startCMD: string) => {
    const options = {
      script: `npm -- run start`,
      name: 'site-server',
      max_restarts: 0,
      node_args: '--no-autorestart',
    }

    return new Promise<void>((resolve, reject) => {
      try {
        pm2.connect(function (err) {
          if (err) {
            throw err
          }
          console.log('connected to pm2')
          pm2.start(options, (err, apps) => {
            if (err) {
              throw err
            }
            console.log('started server')

            pm2.disconnect()
            resolve()
          })
        })
      } catch (error) {
        console.log('threw an error: ', error)
        reject()
      }
    })
  }

  const startStaticPMServer = async (projectDir: string) => {
    const options: pm2.StartOptions = {
      script: `serve`,
      name: 'site-server',
      max_restarts: 0,
      env: {
        PM2_SERVE_PATH: `${projectDir}`,
        // @ts-ignore
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_HOMEPAGE: './index.html',
      },
    }

    console.info(options)

    return new Promise<void>((resolve, reject) => {
      try {
        pm2.connect(function (err) {
          if (err) {
            console.log('cant connect to pm2')
            throw err
          }
          console.log('connected to pm2')

          pm2.start(options, (err, apps) => {
            if (err) {
              throw err
            }
            console.log('started pm2')

            pm2.disconnect()
            resolve()
          })
        })
      } catch (error) {
        console.log('threw an error: ', error)
        reject()
      }
    })
  }

  const stopPMServer = () => {
    return new Promise<void>((resolve, reject) => {
      try {
        pm2.delete('site-server', (err, proc) => {
          if (err) {
            console.log(err)
            process.exit(2)
          }
          resolve()
        })
      } catch (error) {
        pm2.disconnect()
        reject()
      }
    })
  }

  // let file = new StaticServer(__dirname)
  let server: http.Server

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
      await startPMServer(buildCMD, startCMD)
    }
  }

  const stopServer = async (isStatic: boolean) => {
    if (isStatic) {
      stopStaticServer()
    } else {
      await stopPMServer()
    }
  }

  return {
    startServer,
    stopServer,
  }
})()
