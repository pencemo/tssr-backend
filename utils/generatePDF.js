import express from "express";
import puppeteer from "puppeteer";
const router = express.Router();

router.post("/generate-pdf", async (req, res) => {
  let browser;
  try {
    const { html } = req.body;
    if (!html) {
      return res.status(400).json({ success: false, message: "Missing HTML" });
    }

    // Wrap component HTML with Tailwind & full HTML doc
    const fullHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <base href="https://app.tssrcouncil.com/" />
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
      <style>
        body { background: white; padding: 20px; font-family: 'Roboto', sans-serif; }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;
  
    console.log(html ? "html found": "no html found");
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
      // executablePath: "/usr/bin/chromium", // installed in Docker
      args: [
        "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",

      "--single-process",
      "--no-zygote",
      ],
    }); 
    const page = await browser.newPage(); 
    if(!page || !browser){
      return res.status(400).json({
        success: false,
        message: "Error creating browser & page",
      })
    }
    // await page.evaluateOnNewDocument((data) => {
    //   window.__PRELOADED_DATA__ = data;
    // }, student);  
    await page.setContent(fullHTML, { waitUntil: "domcontentloaded" });

    // try {
    //   await page.goto(url, {
    //     waitUntil: "domcontentloaded",
    //     timeout: 30000,
    //   });
    // } catch (err) {
    //   console.error("Navigation failed:", err.message);
    //   throw err;
    // }

    // await page.waitForSelector(".student-profile");
    // await page.waitForFunction(() => {
    //   // Check if there's meaningful content
    //   const content = document.body.textContent;
    //   return content && content.length > 100;
    // });

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("requestfailed", (request) => {
      console.log("❌ Failed Request:", request.url(), request.failure());
    });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.3in",
        right: "0.3in",
        bottom: "0.3in",
        left: "0.3in",
      },
    });
    await browser.close();

    if (!pdfBuffer) {
      return res.status(400).json({
        success: false,
        message: "Error generating pdfBuffer",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=student.pdf");
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (browser) {
      await browser.close().catch(e => console.error('Error closing browser:', e));
      console.error("Browser closed" );
    }
    res.status(500).json({
      success: false,
      message: "Error generating PDF", error,
    });
  }
});

export default router;
