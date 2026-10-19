
const pool = require('../config/database');

async function markLessonCompleted(userId, lessonId) {
  const result = await pool.query(
    `
      INSERT INTO lesson_progress (user_id, lesson_id)
      SELECT $1, l.id
      FROM lessons l
      WHERE l.id = $2
        AND l.is_published = TRUE
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET completed_at = lesson_progress.completed_at
      RETURNING id, user_id, lesson_id, completed_at
    `,
    [userId, lessonId]
  );

  return result.rows[0] || null;
}

async function getCompletedLessonsByUser(userId) {
  const result = await pool.query(
    `
      SELECT
        lp.lesson_id,
        l.module_id,
        l.title AS lesson_title,
        lp.completed_at
      FROM lesson_progress lp
      JOIN lessons l ON l.id = lp.lesson_id
      WHERE lp.user_id = $1
      ORDER BY lp.completed_at DESC
    `,
    [userId]
  );

  return result.rows;
}

async function getModuleProgressByUser(userId) {
  const result = await pool.query(
    `
      SELECT
        lm.id AS module_id,
        lm.title AS module_title,
        COUNT(l.id)::INTEGER AS total_lessons,
        COUNT(lp.lesson_id)::INTEGER AS completed_lessons,
        CASE
          WHEN COUNT(l.id) = 0 THEN 0
          ELSE ROUND(
            COUNT(lp.lesson_id)::NUMERIC * 100 / COUNT(l.id)
          )::INTEGER
        END AS progress_percentage
      FROM learning_modules lm
      LEFT JOIN lessons l
        ON l.module_id = lm.id
       AND l.is_published = TRUE
      LEFT JOIN lesson_progress lp
        ON lp.lesson_id = l.id
       AND lp.user_id = $1
      WHERE lm.is_published = TRUE
      GROUP BY lm.id, lm.title
      ORDER BY lm.title
    `,
    [userId]
  );

  return result.rows;
}

module.exports = {
  markLessonCompleted,
  getCompletedLessonsByUser,
  getModuleProgressByUser,
};
