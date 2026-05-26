const express        = require('express');
const router         = express.Router();
const multer         = require('multer');
const path           = require('path');
const fs             = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const Resume         = require('../models/Resume');
const { extractSkillsFromText } = require('../utils/resumeMatcher');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.txt') cb(null, true);
    else cb(new Error('Only PDF and TXT files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// POST upload resume
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    let extractedText = '';

    if (req.file.mimetype === 'text/plain') {
      extractedText = fs.readFileSync(req.file.path, 'utf8');
    } else {
      // For PDF — read as buffer and extract text
      try {
        const pdfParse   = require('pdf-parse');
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData    = await pdfParse(dataBuffer);
        extractedText    = pdfData.text;
      } catch {
        extractedText = req.file.originalname;
      }
    }

    const { matched, missing, matchScore } = extractSkillsFromText(extractedText);

    // Save to DB
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      { userId: req.user.id, fileName: req.file.originalname, extractedText, matchedSkills: matched, missingSkills: missing, matchScore },
      { upsert: true, new: true }
    );

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.json({
      message:       'Resume analyzed!',
      matchedSkills: matched,
      missingSkills: missing,
      matchScore,
      fileName:      req.file.originalname,
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// GET resume analysis
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) return res.json(null);
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

module.exports = router;