import express from "express";
import puppeteer from "puppeteer";
const router = express.Router();

router.post("/generate-pdf", async (req, res) => {
  try {
    const { url } = req.body;
    console.log(url);
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
    await page.goto(url, { 
      waitUntil: "networkidle0", // Changed from domcontentloaded
      timeout: 30000 // Increase timeout
    });

    // await page.waitForSelector(".student-profile [data-loaded]", { 
    //   timeout: 10000 
    // }).catch(() => {
    //   console.log("Data attribute not found, falling back to content wait");
    // });

    await page.waitForFunction(() => {
      const profile = document.querySelector('.student-profile');
      return profile && profile.textContent && profile.textContent.length > 100;
    }, { timeout: 5000 });

    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    page.on("requestfailed", (request) => {
      console.log("❌ Failed Request:", request.url(), request.failure());
    });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    if (!pdfBuffer) {
      return res.status(400).json({
        success: false,
        message: "Error generating PDF",
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
