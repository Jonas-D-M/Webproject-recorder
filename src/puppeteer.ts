import puppeteer, { Browser, Page } from 'puppeteer'
import { PuppeteerScreenRecorder } from './puppeteerRecorder'
import fluent_ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'
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

      try {
        const browserConfig: puppeteer.LaunchOptions &
          puppeteer.BrowserLaunchArgumentOptions &
          puppeteer.BrowserConnectOptions = {
          executablePath,
          headless: true,
          ignoreHTTPSErrors: true,
          args: minimalArgs,
        }
        const browser = await puppeteer.launch(browserConfig)
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

  const initRecorder = async (page: puppeteer.Page, ffmpegPath: string) => {
    return new Promise<PuppeteerScreenRecorder>((resolve, reject) => {
      try {
        const recordConfig = {
          followNewTab: false,
          fps: 60,
          ffmpeg_Path: ffmpegPath,
          videoFrame: {
            width: 1920,
            height: 1080,
          },
          aspectRatio: '16:9',
        }
        const recorder = new PuppeteerScreenRecorder(page, recordConfig)
        console.log(`init recorder`)

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

    const savePath = `./video/${videoName ?? 'showcase.mp4'}`

    try {
      const urlMap = generateUrlMap(
        ['/home', '/afdelingen', '/over-ons', '/ons-team', '/shop', '/nieuws'],
        url,
      )

      console.info('Recording pages')
      await recordMultiplePages(browser, ffmpegPath, urlMap)

      console.info('Generating showcase video')
      await generateShowcaseVideo()

      console.info('Closing browser')
      await browser.close()

      console.info('Delete temp vid dir')

      fs.rmSync(path.join(process.cwd(), 'tmpvid'), { recursive: true })
    } catch (error) {
      console.log(error)
      browser.close()
      throw error
    }
  }

  const recordMultiplePages = (
    browser: Browser,
    ffmpegPath: string,
    urlMap: Array<string>,
  ) => {
    return new Promise<void>((resolve, reject) => {
      Promise.all(
        urlMap.map(async (url, i) => {
          await recordPage(browser, ffmpegPath, url, i)
        }),
      )
        .then(values => {
          console.log(values)

          resolve()
        })
        .catch(err => reject(err))
    })
  }

  const generateShowcaseVideo = (vidName?: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const videoName = vidName ?? 'showcase-video.mp4'
        let mergedVideo = fluent_ffmpeg()

        const tmpDirPath = path.join(process.cwd(), 'tmpvid')
        const finalDirPath = path.join(process.cwd(), 'video')

        const tmpVideos = fs
          .readdirSync(tmpDirPath)
          .map(f => path.join(tmpDirPath, f))

        console.log(tmpVideos)

        tmpVideos.forEach(vid => {
          mergedVideo = mergedVideo.addInput(vid)
        })

        mergedVideo
          .mergeToFile(`${finalDirPath}/${videoName}`)
          .on('error', err => {
            throw err
          })
          .on('end', () => resolve())
      } catch (error) {
        reject(error)
        throw error
      }
    })
  }

  const generateUrlMap = (
    routes: Array<string>,
    baseUrl: string,
    isHTML = false,
  ) => {
    return routes.map(route => `${baseUrl}${route}${isHTML ? '.html' : ''}`)
  }

  const recordPage = (
    browser: Browser,
    ffmpegPath: string,
    url: string,
    index: number,
  ) => {
    return new Promise<void>(async (resolve, reject) => {
      const resolution = { width: 1920, height: 1080 }
      try {
        console.log('going to ', url)
        const page = await browser.newPage()
        await initViewport(page, resolution)
        const recorder = await initRecorder(page, ffmpegPath)
        await retry(() => page.goto(url, { waitUntil: 'networkidle0' }), 1000)
        await recorder.start(`./tmpvid/tmp-${index}.mp4`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        await smoothAutoScroll(page)
        await recorder.stop()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
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
    const recorder = await initRecorder(page, ffmpegPath)
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
