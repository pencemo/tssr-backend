import express from "express";
import puppeteer from "puppeteer";
const router = express.Router();

router.post("/generate-pdf", async (req, res) => {
    try {
      const { url } = req.body; // e.g. http://localhost:3000/student-profile/123
      console.log(url); 
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
  
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".student-profile", { timeout: 60000 }); 
      // await page.waitForT(2000);

      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
      await browser.close();
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=student.pdf");
      res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Error generating PDF");
    }
  });

  export default router;