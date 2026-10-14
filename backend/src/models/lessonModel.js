const pool = require('../config/database')

async function getPublishedLessonsByModuleId(moduleId) {
  const result = await pool.query(
    `
      SELECT
        l.id,
        l.module_id,
        l.title,
        l.content,
        l.lesson_order,
        l.is_published,
        l.created_at,
        l.updated_at
      FROM lessons l
      WHERE l.module_id = $1
        AND l.is_published = TRUE
      ORDER BY l.lesson_order ASC, l.created_at ASC
    `,
    [moduleId]
  )

  return result.rows
}

async function getLessonById(id) {
  const result = await pool.query(
    `
      SELECT
        l.id,
        l.module_id,
        l.title,
        l.content,
        l.lesson_order,
        l.is_published,
        l.created_at,
        l.updated_at
      FROM lessons l
      WHERE l.id = $1
        AND l.is_published = TRUE
    `,
    [id]
  )

  return result.rows[0] || null
}

async function createLesson({
  module_id,
  title,
  content,
  lesson_order = 1,
  is_published = false,
}) {
  const result = await pool.query(
    `
      INSERT INTO lessons
        (
          module_id,
          title,
          content,
          lesson_order,
          is_published
        )
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        id,
        module_id,
        title,
        content,
        lesson_order,
        is_published,
        created_at,
        updated_at
    `,
    [
      module_id,
      title,
      content,
      lesson_order,
      is_published,
    ]
  )

  return result.rows[0]
}

module.exports = {
  getPublishedLessonsByModuleId,
  getLessonById,
  createLesson,
}