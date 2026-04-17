import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors()); // Allows frontend to talk to backend
app.use(express.json());

app.post('/predict', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No image uploaded.');

  const imagePath = path.resolve(req.file.path);
  const scriptPath = path.resolve(__dirname, '../scripts/predict.py');
  
  // Use 'python3' for Linux
  const pythonProcess = spawn('python3', [scriptPath, imagePath]);

  let result = '';
  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: "Python script failed" });
    }

    // Extracting data from Python output
    const lines = result.split('\n');
    const label = lines.find(l => l.startsWith('RESULT:'))?.split(': ')[1] || "Unknown";
    const confidence = lines.find(l => l.startsWith('CONFIDENCE:'))?.split(': ')[1] || "0%";

    res.json({ label, confidence });
  });
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [BACKEND] API running on http://127.0.0.1:${PORT}`);
});