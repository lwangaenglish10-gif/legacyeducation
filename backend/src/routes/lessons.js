
const express = require('express');

const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const {
  getPublishedLessonsByModuleId,
  getLessonById,
  createLesson,
} = require('../models/lessonModel');

const {
  markLessonCompleted,
  getCompletedLessonsByUser,
  getModuleProgressByUser,
} = require('../models/lessonProgressModel');

const router = express.Router();

// GET /api/lessons/module/:moduleId
// Get all published lessons for a module
router.get('/module/:moduleId', async (req, res) => {
  try {
    const moduleId = Number(req.params.moduleId);

    if (!Number.isInteger(moduleId) || moduleId < 1) {
      return res.status(400).json({
        message: 'Invalid module ID.',
      });
    }

    const lessons = await getPublishedLessonsByModuleId(moduleId);

    return res.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);

    return res.status(500).json({
      message: 'Failed to fetch lessons.',
    });
  }
});

// GET /api/lessons/progress/me
// Get completed lessons for the logged-in user
router.get('/progress/me', protect, async (req, res) => {
  try {
    const lessons = await getCompletedLessonsByUser(req.user.id);

    return res.json({ lessons });
  } catch (error) {
    console.error('Error fetching completed lessons:', error);

    return res.status(500).json({
      message: 'Failed to fetch lesson progress.',
    });
  }
});

// GET /api/lessons/progress/modules
// Get progress for the logged-in user across published modules
router.get('/progress/modules', protect, async (req, res) => {
  try {
    const modules = await getModuleProgressByUser(req.user.id);

    return res.json({ modules });
  } catch (error) {
    console.error('Error fetching module progress:', error);

    return res.status(500).json({
      message: 'Failed to fetch module progress.',
    });
  }
});

// GET /api/lessons/:id
// Get one published lesson
router.get('/:id', async (req, res) => {
  try {
    const lessonId = Number(req.params.id);

    if (!Number.isInteger(lessonId) || lessonId < 1) {
      return res.status(400).json({
        message: 'Invalid lesson ID.',
      });
    }

    const lesson = await getLessonById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        message: 'Lesson not found.',
      });
    }

    return res.json({ lesson });
  } catch (error) {
    console.error('Error fetching lesson:', error);

    return res.status(500).json({
      message: 'Failed to fetch lesson.',
    });
  }
});

// POST /api/lessons/:id/complete
// Mark a published lesson complete for the logged-in user
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const lessonId = Number(req.params.id);

    if (!Number.isInteger(lessonId) || lessonId < 1) {
      return res.status(400).json({
        message: 'Invalid lesson ID.',
      });
    }

    const progress = await markLessonCompleted(
      req.user.id,
      lessonId
    );

    if (!progress) {
      return res.status(404).json({
        message: 'Published lesson not found.',
      });
    }

    return res.status(200).json({
      message: 'Lesson marked as completed.',
      progress,
    });
  } catch (error) {
    console.error('Error marking lesson completed:', error);

    return res.status(500).json({
      message: 'Failed to save lesson progress.',
    });
  }
});

// POST /api/lessons
// Only authenticated admins and teachers can create lessons
router.post(
  '/',
  protect,
  authorize('admin', 'teacher'),
  async (req, res) => {
    try {
      const {
        module_id,
        title,
        content,
        lesson_order,
        is_published,
      } = req.body;

      if (
        !Number.isInteger(Number(module_id)) ||
        Number(module_id) < 1
      ) {
        return res.status(400).json({
          message: 'A valid module ID is required.',
        });
      }

      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          message: 'Lesson title is required.',
        });
      }

      if (typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({
          message: 'Lesson content is required.',
        });
      }

      const lesson = await createLesson({
        module_id: Number(module_id),
        title: title.trim(),
        content: content.trim(),
        lesson_order,
        is_published,
      });

      return res.status(201).json({
        message: 'Lesson created successfully.',
        lesson,
      });
    } catch (error) {
      console.error('Error creating lesson:', error);

      return res.status(500).json({
        message: 'Failed to create lesson.',
      });
    }
  }
);

module.exports = router;
