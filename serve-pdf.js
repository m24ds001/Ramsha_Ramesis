import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Use Railway's assigned port, fallback to 3000 for local dev
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the download page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'download-report.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ PDF server is running at http://0.0.0.0:${PORT}`);
  console.log(`Download page: http://0.0.0.0:${PORT}`);
  console.log(`Direct PDF: http://0.0.0.0:${PORT}/analytics-platform-report.pdf`);
});
