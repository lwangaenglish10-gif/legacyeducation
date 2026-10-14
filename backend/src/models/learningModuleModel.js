const pool = require('../config/database')

async function getPublishedModules() {
  const result = await pool.query(`
    SELECT
      lm.id,
      lm.title,
      lm.description,
      lm.level,
      lm.is_published,
      lm.created_at,
      lm.updated_at,
      u.full_name AS creator_name
    FROM learning_modules lm
    LEFT JOIN users u
      ON lm.created_by = u.id
    WHERE lm.is_published = TRUE
    ORDER BY lm.created_at DESC
  `)

  return result.rows
}

async function getModuleById(id) {
  const result = await pool.query(
    `
      SELECT
        lm.id,
        lm.title,
        lm.description,
        lm.level,
        lm.is_published,
        lm.created_at,
        lm.updated_at,
        u.full_name AS creator_name
      FROM learning_modules lm
      LEFT JOIN users u
        ON lm.created_by = u.id
      WHERE lm.id = $1
        AND lm.is_published = TRUE
    `,
    [id]
  )

  return result.rows[0] || null
}

async function createModule({
  title,
  description,
  level,
  created_by,
  is_published = false,
}) {
  const result = await pool.query(
    `
      INSERT INTO learning_modules
        (title, description, level, created_by, is_published)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        id,
        title,
        description,
        level,
        is_published,
        created_by,
        created_at,
        updated_at
    `,
    [
      title,
      description || null,
      level || null,
      created_by,
      is_published,
    ]
  )

  return result.rows[0]
}

module.exports = {
  getPublishedModules,
  getModuleById,
  createModule,
}