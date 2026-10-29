import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

const router = Router();
router.use(authMiddleware);

// Set up multer for local file storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/assets/upload
router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        url,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

export default router;
