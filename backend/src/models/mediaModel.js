
const pool = require("../config/database");

async function createMedia({
  title,
  description,
  media_type,
  file_url,
  thumbnail_url,
  mime_type,
  file_size_bytes,
  status,
  uploaded_by,
}) {
  const query = `
    INSERT INTO media (
      title,
      description,
      media_type,
      file_url,
      thumbnail_url,
      mime_type,
      file_size_bytes,
      status,
      uploaded_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    title,
    description ?? null,
    media_type,
    file_url,
    thumbnail_url ?? null,
    mime_type ?? null,
    file_size_bytes ?? null,
    status ?? "draft",
    uploaded_by,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getPublishedMedia({ type } = {}) {
  const query = `
    SELECT *
    FROM media
    WHERE status = 'published'
      AND ($1::text IS NULL OR media_type = $1)
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [type || null]);
  return result.rows;
}
async function getAllMedia() {
  const result = await pool.query(`
    SELECT *
    FROM media
    ORDER BY created_at DESC
  `);

  return result.rows;
}
async function getMediaById(id) {
  const result = await pool.query(
    "SELECT * FROM media WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
}

async function updateMedia(id, fields) {
  const allowedFields = [
    "title",
    "description",
    "media_type",
    "file_url",
    "thumbnail_url",
    "mime_type",
    "file_size_bytes",
    "status",
  ];

  const entries = Object.entries(fields).filter(
    ([key, value]) =>
      allowedFields.includes(key) && value !== undefined
  );

  if (entries.length === 0) {
    return getMediaById(id);
  }

  const setClauses = entries.map(
    ([key], index) => `${key} = $${index + 1}`
  );

  setClauses.push("updated_at = CURRENT_TIMESTAMP");

  const values = entries.map(([, value]) => value);
  values.push(id);

  const query = `
    UPDATE media
    SET ${setClauses.join(", ")}
    WHERE id = $${values.length}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

async function deleteMedia(id) {
  const result = await pool.query(
    "DELETE FROM media WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  createMedia,
  getPublishedMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
};