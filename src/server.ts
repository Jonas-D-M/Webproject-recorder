import pm2 from 'pm2'

export default (() => {
  const startPMServer = async (buildCMD: string, startCMD: string) => {
    const options = {
      script: `cd test2 && npm -- run ${startCMD}`,
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
          pm2.start(options, (err, apps) => {
            if (err) {
              throw err
            }
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

  const startStaticPMServer = async () => {
    const options: pm2.StartOptions = {
      script: `serve`,
      name: 'site-server',
      max_restarts: 0,
      env: {
        PM2_SERVE_PATH: './test',
        PM2_SERVE_PORT: '3000',
        PM2_SERVE_HOMEPAGE: './index.html',
      },
    }

    return new Promise<void>((resolve, reject) => {
      try {
        pm2.connect(function (err) {
          if (err) {
            throw err
          }
          pm2.start(options, (err, apps) => {
            if (err) {
              throw err
            }
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

  return {
    startPMServer,
    startStaticPMServer,
    stopPMServer,
  }
})()
