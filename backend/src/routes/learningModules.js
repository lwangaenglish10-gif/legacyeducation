const express = require('express')
const {
  getPublishedModules,
  getModuleById,
  createModule,
} = require('../models/learningModuleModel')

const router = express.Router()

// GET /api/learning-modules
// Get all published learning modules
router.get('/', async (req, res) => {
  try {
    const modules = await getPublishedModules()

    res.json({
      modules,
    })
  } catch (error) {
    console.error('Error fetching learning modules:', error)

    res.status(500).json({
      message: 'Failed to fetch learning modules.',
    })
  }
})

// GET /api/learning-modules/:id
// Get one published learning module
router.get('/:id', async (req, res) => {
  try {
    const moduleId = Number(req.params.id)

    if (!Number.isInteger(moduleId)) {
      return res.status(400).json({
        message: 'Invalid module ID.',
      })
    }

    const module = await getModuleById(moduleId)

    if (!module) {
      return res.status(404).json({
        message: 'Learning module not found.',
      })
    }

    res.json({
      module,
    })
  } catch (error) {
    console.error('Error fetching learning module:', error)

    res.status(500).json({
      message: 'Failed to fetch learning module.',
    })
  }
})

// POST /api/learning-modules
// Create a learning module
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      level,
      created_by,
      is_published,
    } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Module title is required.',
      })
    }

    if (!created_by) {
      return res.status(400).json({
        message: 'Creator ID is required.',
      })
    }

    const module = await createModule({
      title: title.trim(),
      description,
      level,
      created_by,
      is_published,
    })

    res.status(201).json({
      message: 'Learning module created successfully.',
      module,
    })
  } catch (error) {
    console.error('Error creating learning module:', error)

    res.status(500).json({
      message: 'Failed to create learning module.',
    })
  }
})

module.exports = router