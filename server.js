// step 1 - define the web scraper

const puppeteer = require('puppeteer')

async function scrapeData(url) {
    if (!url) {return}
    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()
    await page.goto(url)
    await page.waitForSelector(`td:nth-child(6)`)

    const data = await page.evaluate(() => {
        const elements = document.querySelectorAll('td:nth-child(6)')
        return Array.from(elements).map(element => element.textContent.trim())
    })

    await browser.close()
    return data
}

(async () => {
    try {
        const data = await scrapeData('https://finance.yahoo.com/quote/PYPL/history/')

        console.log(data)
    } catch (error) {
        console.error('Error', error)
    }
})()

module.exports = {scrapeData}


// step 2 - initialize server that serves up an html file that the user can play with

const express = require('express')
const app = express()
const port = 8383

// middleware

app.use(express.json())
app.use(require('cors')())
app.use(express.static('public'))

app.listen(port, () => {console.log(`Server has started on port: ${port}`)})

// step 3 - define api endpoints to access stock data (and call webscraper)

app.post('/api', async (req, res) => {
    const {stock_ticker: ticker} = req.body
    console.log(ticker)
    const prices = await scrapeData(ticker)
    res.statusCode(200).send({ prices })
})

