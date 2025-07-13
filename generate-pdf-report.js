import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
  console.log('Starting PDF generation process...');
  
  // Check if HTML file exists
  const htmlPath = path.join(__dirname, 'project-report.html');
  if (!fs.existsSync(htmlPath)) {
    console.error('Error: project-report.html not found. Please ensure the file exists before running this script.');
    return;
  }

  try {
    // Launch a headless browser
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',  // Use new headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Read the HTML file content
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Set the content of the page
    console.log('Loading HTML content...');
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    // Set PDF options
    const pdfOptions = {
      path: 'analytics-platform-report.pdf',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    };
    
    // Generate PDF
    console.log('Generating PDF...');
    await page.pdf(pdfOptions);
    
    // Close the browser
    await browser.close();
    
    console.log('PDF successfully generated: analytics-platform-report.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

// Run the PDF generation
generatePDF();