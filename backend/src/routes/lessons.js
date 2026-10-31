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

router.get('/module/:moduleId', async (req, res) => {
  try {
    const moduleId = Number(req.params.moduleId);
    if (!Number.isInteger(moduleId) || moduleId < 1) {
      return res.status(400).json({ message: 'Invalid module ID.' });
    }

    const lessons = await getPublishedLessonsByModuleId(moduleId);
    return res.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return res.status(500).json({ message: 'Failed to fetch lessons.' });
  }
});

router.get('/progress/me', protect, async (req, res) => {
  try {
    const lessons = await getCompletedLessonsByUser(req.user.id);
    return res.json({ lessons });
  } catch (error) {
    console.error('Error fetching completed lessons:', error);
    return res.status(500).json({ message: 'Failed to fetch lesson progress.' });
  }
});

router.get('/progress/modules', protect, async (req, res) => {
  try {
    const modules = await getModuleProgressByUser(req.user.id);
    return res.json({ modules });
  } catch (error) {
    console.error('Error fetching module progress:', error);
    return res.status(500).json({ message: 'Failed to fetch lesson progress.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lessonId = Number(req.params.id);
    if (!Number.isInteger(lessonId) || lessonId < 1) {
      return res.status(400).json({ message: 'Invalid lesson ID.' });
    }

    const lesson = await getLessonById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    return res.json({ lesson });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return res.status(500).json({ message: 'Failed to fetch lesson.' });
  }
});

router.post('/:id/complete', protect, async (req, res) => {
  try {
    const lessonId = Number(req.params.id);
    if (!Number.isInteger(lessonId) || lessonId < 1) {
      return res.status(400).json({ message: 'Invalid lesson ID.' });
    }

    const progress = await markLessonCompleted(req.user.id, lessonId);
    if (!progress) {
      return res.status(404).json({ message: 'Published lesson not found.' });
    }

    return res.status(200).json({
      message: 'Lesson marked as completed.',
      progress,
    });
  } catch (error) {
    console.error('Error marking lesson completed:', error);
    return res.status(500).json({ message: 'Failed to save lesson progress.' });
  }
});

// Only the administrator can create lessons and decide whether they publish.
router.post(
  '/',
  protect,
  authorize('admin'),
  async (req, res) => {
    try {
      const { module_id, title, content, lesson_order, is_published } = req.body;

      if (!Number.isInteger(Number(module_id)) || Number(module_id) < 1) {
        return res.status(400).json({ message: 'A valid module ID is required.' });
      }
      if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
        return res.status(400).json({ message: 'Lesson title is required and must be 200 characters or fewer.' });
      }
      if (typeof content !== 'string' || !content.trim() || content.length > 1000000) {
        return res.status(400).json({ message: 'Lesson content is required and must be 1,000,000 characters or fewer.' });
      }

      const lesson = await createLesson({
        module_id: Number(module_id),
        title: title.trim(),
        content: content.trim(),
        lesson_order,
        is_published: is_published === true,
      });

      return res.status(201).json({
        message: 'Lesson created successfully.',
        lesson,
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      return res.status(500).json({ message: 'Failed to create lesson.' });
    }
  }
);

module.exports = router;
