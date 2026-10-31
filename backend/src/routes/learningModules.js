
const express = require('express');

const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const {
  getPublishedModules,
  getModuleById,
  createModule,
} = require('../models/learningModuleModel');

const router = express.Router();

// GET /api/learning-modules
// Get all published learning modules
router.get('/', async (req, res) => {
  try {
    const modules = await getPublishedModules();

    res.json({
      modules,
    });
  } catch (error) {
    console.error('Error fetching learning modules:', error);

    res.status(500).json({
      message: 'Failed to fetch learning modules.',
    });
  }
});

// GET /api/learning-modules/:id
// Get one published learning module
router.get('/:id', async (req, res) => {
  try {
    const moduleId = Number(req.params.id);

    if (!Number.isInteger(moduleId) || moduleId < 1) {
      return res.status(400).json({
        message: 'Invalid module ID.',
      });
    }

    const module = await getModuleById(moduleId);

    if (!module) {
      return res.status(404).json({
        message: 'Learning module not found.',
      });
    }

    res.json({
      module,
    });
  } catch (error) {
    console.error('Error fetching learning module:', error);

    res.status(500).json({
      message: 'Failed to fetch learning module.',
    });
  }
});

// POST /api/learning-modules
// Only authenticated admins and teachers can create modules
router.post(
  '/',
  protect,
  authorize('admin', 'teacher'),
  async (req, res) => {
    try {
      const {
        title,
        description,
        level,
        is_published,
      } = req.body;

      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          message: 'Module title is required.',
        });
      }

      // The authenticated user's ID is used as the creator.
      // Never trust a creator ID supplied by the request body.
      const module = await createModule({
        title: title.trim(),
        description,
        level,
        created_by: req.user.id,
        is_published: is_published === true,
      });

      res.status(201).json({
        message: 'Learning module created successfully.',
        module,
      });
    } catch (error) {
      console.error('Error creating learning module:', error);

      res.status(500).json({
        message: 'Failed to create learning module.',
      });
    }
  }
);

module.exports = router;
