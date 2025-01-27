const puppeteer = require("puppeteer")

const createPdf = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()

    await page.goto("https://resumeworded.com/", {
      waitUntil: "networkidle2",
    })

    const options = {
      path: "website.pdf",
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    }

    await page.pdf(options)
    console.log("PDF created successfully!")
  } catch (error) {
    console.error("Error creating PDF:", error)
  } finally {
    await browser.close()
  }
}

createPdf()


// puppeteer needs nodejs to run => can't run with react in the frontend
// dont try to download a website running on a local server with puppeteer. it wont succeed. its a pretty limited library. this is mostly what it does.
// funky business like sending a pdf blob from frontend to backend also doesnt really work... this approach works tho:

//generate the pdf in the backend & instead of sending it to the frontend or converting it to a blob that might fail, can we make it accessible to the frontend guy via sending the pdf that is generated in the backend. Basically what i wanna do is do the entire processing in the backend only, & the final product tha ti s generated is to be sent to the frontend

