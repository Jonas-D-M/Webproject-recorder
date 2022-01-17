import puppeteer, { Page, Puppeteer } from 'puppeteer'
import { PuppeteerScreenRecorder } from './puppeteerRecorder'
import { retry } from './utils'

export default (() => {
  const initBrowser = async (executablePath: string) => {
    return new Promise<puppeteer.Browser>(async (resolve, reject) => {
      const minimalArgs = [
        '--autoplay-policy=user-gesture-required',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-dev-shm-usage',
        '--disable-domain-reliability',
        '--disable-extensions',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-notifications',
        '--disable-offer-store-unmasked-wallet-cards',
        '--disable-popup-blocking',
        '--disable-print-preview',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-setuid-sandbox',
        '--disable-speech-api',
        '--disable-sync',
        '--hide-scrollbars',
        '--ignore-gpu-blacklist',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run',
        '--no-pings',
        '--no-sandbox',
        '--no-zygote',
        '--password-store=basic',
        '--use-gl=swiftshader',
        '--use-mock-keychain',
      ]
      const triedArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--start-maximized',
        '--disable-dev-shm-usage',
        '--headless',
      ]

      try {
        const browserConfig: puppeteer.LaunchOptions &
          puppeteer.BrowserLaunchArgumentOptions &
          puppeteer.BrowserConnectOptions = {
          executablePath,
          headless: true,
          ignoreHTTPSErrors: true,
          args: minimalArgs,
        }
        const browser = await puppeteer.launch(browserConfig).then(async br => {
          return br
        })
        console.info(
          `Browser is running with process id ${browser.process()?.pid}`,
        )
        resolve(browser)
      } catch (error) {
        reject(error)
        throw error
      }
    })
  }

  const initRecording = async (
    page: puppeteer.Page,
    savePath: string,
    ffmpegPath: string,
  ) => {
    return new Promise<PuppeteerScreenRecorder>((resolve, reject) => {
      try {
        const recordConfig = {
          followNewTab: true,
          fps: 60,
          ffmpeg_Path: ffmpegPath,
          videoFrame: {
            width: 1920,
            height: 1080,
          },
          aspectRatio: '16:9',
        }
        const recorder = new PuppeteerScreenRecorder(page, recordConfig)

        resolve(recorder)
      } catch (error) {
        reject(error)
        throw error
      }
    })
  }

  const initViewport = async (
    page: puppeteer.Page,
    resolution: { width: number; height: number },
  ) => {
    console.info('Setting viewport')
    await page.setViewport(resolution)
  }

  const recordLocalServer = async (
    ffmpegPath: string,
    executablePath: string,
    videoName?: string,
  ) => {
    const browser = await initBrowser(executablePath)
    const url = 'http://localhost:3000'
    const resolution = { width: 1920, height: 1080 }
    const savePath = `./video/${videoName ?? 'showcase.mp4'}`

    const [page] = await browser.pages()

    await initViewport(page, resolution)
    const recorder = await initRecording(page, savePath, ffmpegPath)
    try {
      console.info('Going to url')
      await retry(() => page.goto(url, { waitUntil: 'networkidle0' }), 1000)

      console.info('Starting recorder')
      await recorder.start(savePath)

      console.info('Waiting a second before scrolling down')
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.info('Scrolling to end of page')
      await smoothAutoScroll(page)

      console.info('Stopping recorder')
      await recorder.stop()

      console.info('Closing browser')
      browser.close()
    } catch (error) {
      console.log(error)
      recorder.stop()
      browser.close()
      throw error
    }
  }

  const example = async (
    ffmpegPath: string,
    executablePath: string,
    videoName?: string,
  ) => {
    const browser = await initBrowser(executablePath)
    const url = 'https://github.com'
    const resolution = { width: 1920, height: 1080 }
    const savePath = `./video/${videoName ?? 'showcase.mp4'}`

    const [page] = await browser.pages()

    await initViewport(page, resolution)
    const recorder = await initRecording(page, savePath, ffmpegPath)
    try {
      console.info('Going to url')
      await page.goto(url)

      console.info('Waiting a second before scrolling down')
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.info('Scrolling to end of page')
      await smoothAutoScroll(page)

      console.info('Stopping recorder')
      await recorder.stop()

      console.info('Closing browser')
      browser.close()
    } catch (error) {
      console.log(error)
      recorder.stop()
      browser.close()
      throw error
    }
  }

  return { example, recordLocalServer }
})()

const smoothAutoScroll = async (page: Page) => {
  await page.evaluate(async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        let totalHeight = 1
        const docHeight = document.body.scrollHeight
        const delay = 1 //delay in milliseconds

        let timer = setInterval(() => {
          window.scroll(0, totalHeight)
          totalHeight += 5

          if (totalHeight >= docHeight) {
            clearInterval(timer)
            resolve()
          }
        }, delay)
      } catch (error) {
        reject(error)
        throw error
      }
    })
  })
}

const autoScroll = async (page: Page) => {
  await page.evaluate(async () => {
    return await new Promise<void>((resolve, reject) => {
      try {
        let totalHeight = 0
        let distance = 100

        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight
          window.scrollBy(0, distance)
          totalHeight += distance

          if (totalHeight >= scrollHeight) {
            clearInterval(timer)
            resolve()
          }
        }, 200)
      } catch (error) {
        reject(error)
        throw error
      }
    })
  })
}
