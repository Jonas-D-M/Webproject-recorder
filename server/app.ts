import puppeteer, { Page } from 'puppeteer'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';



(async () => {
    const browserConfig = {
        headless: false,
        args: ['--start-maximized']
    }
    const recordConfig = {
        followNewTab: true,
        fps: 25,
        ffmpeg_Path: "/usr/bin/ffmpeg",
        videoFrame: {
            width: 1024,
            height: 768,
        },
        aspectRatio: '4:3',
    };
    let processId
    const browser = await puppeteer.launch(browserConfig).then((browser) => {
        processId = browser.process()?.pid
        return browser
    })

    try {


        const width = 1920
        const height = 1080
        const url = "https://github.com"


        const [page] = await browser.pages()
        const recorder = new PuppeteerScreenRecorder(page, recordConfig)
        const savePath = "./tmp/test.mp4"


        await page.setViewport({ width, height })

        await recorder.start(savePath)

        await page.goto(url)

        await autoScroll(page)

        await recorder.stop()

        await browser.close()



    } catch (error) {

        browser.close()
    }


})()

async function autoScroll(page: Page) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}