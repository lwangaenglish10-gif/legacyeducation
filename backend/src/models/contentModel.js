
const pool = require("../config/database");

const createContent = async ({
  title,
  slug,
  body,
  content_type,
  author_id,
  status = "draft",
}) => {
  const query = `
    INSERT INTO content (
      title,
      slug,
      body,
      content_type,
      author_id,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      title,
      slug,
      body,
      content_type,
      status,
      author_id,
      created_at,
      updated_at
  `;

  const values = [
    title,
    slug,
    body,
    content_type,
    author_id,
    status,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getPublishedContent = async (contentType = null) => {
  let query = `
    SELECT
      c.id,
      c.title,
      c.slug,
      c.body,
      c.content_type,
      c.status,
      c.author_id,
      c.created_at,
      c.updated_at,
      u.full_name AS author_name
    FROM content c
    JOIN users u ON c.author_id = u.id
    WHERE c.status = 'published'
  `;

  const values = [];

  if (contentType) {
    query += " AND c.content_type = $1";
    values.push(contentType);
  }

  query += " ORDER BY c.created_at DESC";

  const result = await pool.query(query, values);
  return result.rows;
};
const getContentByAuthor = async (authorId) => {
  const result = await pool.query(
    `
      SELECT
        c.id,
        c.title,
        c.slug,
        c.body,
        c.content_type,
        c.status,
        c.author_id,
        c.created_at,
        c.updated_at,
        u.full_name AS author_name
      FROM content c
      JOIN users u ON c.author_id = u.id
      WHERE c.author_id = $1
      ORDER BY c.created_at DESC
    `,
    [authorId]
  );

  return result.rows;
};

const getContentForReview = async () => {
  const result = await pool.query(
    `
      SELECT
        c.id,
        c.title,
        c.slug,
        c.body,
        c.content_type,
        c.status,
        c.author_id,
        c.created_at,
        c.updated_at,
        u.full_name AS author_name
      FROM content c
      JOIN users u ON c.author_id = u.id
      WHERE c.status = 'draft'
        AND c.content_type = 'article'
      ORDER BY c.created_at ASC
    `
  );

  return result.rows;
};
const getContentById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM content WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

const updateContent = async (id, fields) => {
  const allowedFields = [
    "title",
    "slug",
    "body",
    "content_type",
    "status",
  ];

  const updates = [];
  const values = [];
  let position = 1;

  for (const field of allowedFields) {
    if (fields[field] !== undefined) {
      updates.push(`${field} = $${position}`);
      values.push(fields[field]);
      position++;
    }
  }

  if (updates.length === 0) {
    return getContentById(id);
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  const query = `
    UPDATE content
    SET ${updates.join(", ")}
    WHERE id = $${position}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteContent = async (id) => {
  const result = await pool.query(
    "DELETE FROM content WHERE id = $1 RETURNING id",
    [id]
  );

  return result.rows[0];
};
// Retrieve a student's own stories and articles

// Retrieve unpublished stories and articles for administrator review
module.exports = {
  createContent,
  getPublishedContent,
  getContentByAuthor,
  getContentForReview,
  getContentById,
  updateContent,
  deleteContent,
};