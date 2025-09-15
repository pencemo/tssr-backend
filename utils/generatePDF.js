import express from "express";
import puppeteer from "puppeteer";
const router = express.Router();

router.post("/generate-pdf", async (req, res) => {
  let browser;
  try {
    const { url, student } = req.body;

    if(!url || !student) {
      return res.status(400).json({
        success: false, 
        message: "Missing required fields",
      });
    }
    console.log(url);
    const CHROMIUM_PATH = '/usr/bin/chromium-browser';
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: CHROMIUM_PATH,  
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
      ],
    }); 
    const page = await browser.newPage(); 
    if(!page || !browser){
      return res.status(400).json({
        success: false,
        message: "Error creating browser & page",
      })
    }
    await page.evaluateOnNewDocument((data) => {
      window.__PRELOADED_DATA__ = data;
    }, student);  

    await page.goto(url, {
      waitUntil: "domcontentloaded",  
      timeout: 0,
    });

    await page.waitForFunction(() => {
      // Check if there's meaningful content
      const content = document.body.textContent;
      return content && content.length > 100;
    });

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
    try {
      if (browser) {
        const pages = await browser.pages();
        if (pages[0]) {
          await pages[0].screenshot({ path: "/tmp/puppeteer-debug.png", fullPage: true });
          const html = await pages[0].content();
          require('fs').writeFileSync("/tmp/puppeteer-debug.html", html);
          console.error("Saved debug artifacts to /tmp");
        }
      }
    } catch (di) {
      console.error("Failed saving debug artifacts:", di);
    }
    res.status(500).json({
      success: false,
      message: "Error generating PDF",
    });
  }
});

export default router;
