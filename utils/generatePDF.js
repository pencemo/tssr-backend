import express from "express";
import puppeteer from "puppeteer";
const router = express.Router();

router.post("/generate-pdf", async (req, res) => {
  try {
    const { url, student } = req.body;
    // console.log(student);
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/chromium", // installed in Docker
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      // args: [
      //   "--no-sandbox",
      //   "--disable-setuid-sandbox",
      //   "--disable-gpu",
      //   "--disable-dev-shm-usage",
      // ],
    }); 
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((data) => {
      // This will be available as window.__PRELOADED_STUDENT_DATA__
      window.__PRELOADED_STUDENT_DATA__ = data;
    }, student); 

    await page.goto(url, {
      waitUntil: "networkidle0", // Changed from domcontentloaded
      timeout: 5000, // Increase timeout
    });

    // await page.waitForFunction(
    //   () => { 
    //     return window.__PDF_DATA_LOADED__ === true;
    //   },
    //   { timeout: 10000 }
    // );

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
    res.status(500).json({
      success: false,
      message: "Error generating PDF",
    });
  }
});

export default router;
