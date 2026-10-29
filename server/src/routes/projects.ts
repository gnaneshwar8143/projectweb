import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Project } from '../models/Project';
import mongoose from 'mongoose';

const router = Router();
router.use(authMiddleware);

// GET /api/projects — list user's projects
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({ userId: req.user!._id })
      .sort({ updatedAt: -1 })
      .select('-pages'); // don't return full pages on list
    res.json({ success: true, data: projects });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load projects' });
  }
});

// POST /api/projects — create project
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, pages, settings } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ success: false, error: 'Project name is required' });
      return;
    }
    const project = await Project.create({
      name: name.trim(),
      userId: req.user!._id,
      pages: pages ?? [],
      settings: settings ?? { fonts: ['Inter'], globalStyles: '', primaryColor: '#6370f1' },
      version: 1,
    });
    res.status(201).json({ success: true, data: project });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

// GET /api/projects/:id — get single project with pages
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, error: 'Invalid project ID' });
      return;
    }
    const project = await Project.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load project' });
  }
});

// PUT /api/projects/:id — update project
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, error: 'Invalid project ID' });
      return;
    }
    const { name, pages, settings, description } = req.body;
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) update.name = String(name).trim().slice(0, 200);
    if (pages !== undefined) update.pages = pages;
    if (settings !== undefined) update.settings = settings;
    if (description !== undefined) update.description = String(description).slice(0, 500);

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { $set: update, $inc: { version: 1 } },
      { new: true }
    );
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, error: 'Invalid project ID' });
      return;
    }
    const deleted = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    res.json({ success: true, message: 'Project deleted' });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
});

export default router;
