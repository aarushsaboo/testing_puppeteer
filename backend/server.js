// server.js
const express = require("express")
const cors = require("cors")
const puppeteer = require("puppeteer")
const path = require("path")
const fs = require("fs").promises

const app = express()
app.use(cors())
app.use(express.json())

// Create a directory for storing PDFs if it doesn't exist
const PDF_DIR = path.join(__dirname, "generated-pdfs")
fs.mkdir(PDF_DIR, { recursive: true })

app.post("/generate-pdf", async (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: "URL is required" })
  }

  // Generate a unique filename
  const filename = `pdf-${Date.now()}.pdf`
  const filepath = path.join(PDF_DIR, filename)

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()
    await page.goto(url, {
      waitUntil: "networkidle2",
    })

    await page.pdf({
      path: filepath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    })

    // Return the URL where the PDF can be accessed
    const pdfUrl = `/pdfs/${filename}`
    res.json({
      success: true,
      pdfUrl,
      message: "PDF generated successfully",
    })
  } catch (error) {
    console.error("Error creating PDF:", error)
    res.status(500).json({ error: "Failed to generate PDF" })
  } finally {
    await browser.close()
  }
})

// Serve generated PDFs
app.use("/pdfs", express.static(PDF_DIR))

// Optional: Cleanup old PDFs periodically
const cleanupOldPDFs = async () => {
  try {
    const files = await fs.readdir(PDF_DIR)
    const now = Date.now()
    const ONE_HOUR = 60 * 60 * 1000

    for (const file of files) {
      const filepath = path.join(PDF_DIR, file)
      const stats = await fs.stat(filepath)

      // Delete files older than 1 hour
      if (now - stats.ctimeMs > ONE_HOUR) {
        await fs.unlink(filepath)
      }
    }
  } catch (error) {
    console.error("Cleanup error:", error)
  }
}

// Run cleanup every hour
setInterval(cleanupOldPDFs, 60 * 60 * 1000)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
