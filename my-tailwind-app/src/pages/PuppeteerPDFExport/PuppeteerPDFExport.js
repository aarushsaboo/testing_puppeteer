// PuppeteerPDFExport.js
import React, { useState } from "react"
import styles from "./PuppeteerPDFExport.module.css"

const PuppeteerPDFExport = ({ targetUrl = "http://localhost:3000" }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setPdfUrl(null)

    try {
      const response = await fetch("http://localhost:5000/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
      })

      if (!response.ok) {
        throw new Error("PDF generation failed")
      }

      const data = await response.json()
      setPdfUrl(`http://localhost:5000${data.pdfUrl}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={styles.container}>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`${styles.button} ${
          isGenerating ? styles.buttonDisabled : ""
        }`}
      >
        {isGenerating ? "Generating..." : "Generate PDF"}
      </button>

      {error && <div className={styles.errorAlert}>Error: {error}</div>}

      {pdfUrl && (
        <div className={styles.successContainer}>
          <div className={styles.successAlert}>PDF generated successfully!</div>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            View PDF
          </a>
        </div>
      )}
    </div>
  )
}

export default PuppeteerPDFExport
