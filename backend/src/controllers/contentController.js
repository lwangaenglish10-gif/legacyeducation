
const {
  createContent,
  getPublishedContent,
  getContentByAuthor,
  getContentForReview,
  getContentById,
  updateContent,
  deleteContent,
} = require("../models/contentModel");
const validTypes = ["story", "article"];
const validStatuses = ["draft", "published"];

// Create a story or article
const create = async (req, res) => {
  try {
    const { title, slug, body, content_type, status } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof body !== "string" ||
      !body.trim()
    ) {
      return res.status(400).json({
        message: "Title and body are required.",
      });
    }

    if (!validTypes.includes(content_type)) {
      return res.status(400).json({
        message: "Content type must be story or article.",
      });
    }

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be draft or published.",
      });
    }

    const cleanTitle = title.trim();
    const cleanSlug =
      typeof slug === "string" && slug.trim()
        ? slug.trim().toLowerCase()
        : null;

    const content = await createContent({
      title: cleanTitle,
      slug: cleanSlug,
      body: body.trim(),
      content_type,
      author_id: req.user.id,
    status: req.user.role === "admin" ? (status || "draft") : "draft",
    });

    return res.status(201).json({
      message: "Content created successfully.",
      content,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "That slug is already in use.",
      });
    }

    console.error("Create content error:", error.message);

    return res.status(500).json({
      message: "Unable to create content.",
    });
  }
};

// List published stories and articles
const listPublished = async (req, res) => {
  try {
    const { type } = req.query;

    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        message: "Type must be story or article.",
      });
    }

    const content = await getPublishedContent(type || null);

    return res.status(200).json({
      count: content.length,
      content,
    });
  } catch (error) {
    console.error("List content error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve content.",
    });
  }
};
// List content submitted by the currently logged-in user
const listMySubmissions = async (req, res) => {
  try {
    const content = await getContentByAuthor(req.user.id);

    return res.status(200).json({
      count: content.length,
      content,
    });
  } catch (error) {
    console.error("List own submissions error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve your submissions.",
    });
  }
};

// List draft articles awaiting administrator review
const listForAdminReview = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Only administrators can review submissions.",
    });
  }

  try {
    const content = await getContentForReview();

    return res.status(200).json({
      count: content.length,
      content,
    });
  } catch (error) {
    console.error("Admin review list error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve articles for review.",
    });
  }
};
// View one published story or article
const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid content ID.",
      });
    }

    const content = await getContentById(id);

    if (!content || content.status !== "published") {
      return res.status(404).json({
        message: "Content not found.",
      });
    }

    return res.status(200).json({ content });
  } catch (error) {
    console.error("Get content error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve content.",
    });
  }
};

// Update content owned by the author or an administrator
const update = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid content ID.",
      });
    }

    const existing = await getContentById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Content not found.",
      });
    }

    if (
      existing.author_id !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You cannot edit this content.",
      });
    }

    const { title, slug, body, content_type, status } = req.body;

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      return res.status(400).json({
        message: "Title must be a non-empty string.",
      });
    }

    if (
      body !== undefined &&
      (typeof body !== "string" || !body.trim())
    ) {
      return res.status(400).json({
        message: "Body must be a non-empty string.",
      });
    }

    if (
      content_type !== undefined &&
      !validTypes.includes(content_type)
    ) {
      return res.status(400).json({
        message: "Content type must be story or article.",
      });
    }
if (
  status !== undefined &&
  !validStatuses.includes(status)
) {
  return res.status(400).json({
    message: "Status must be draft or published.",
  });
}
    // Only administrators may change publication status.
    if (status !== undefined && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can change publication status.",
      });
    }

    if (
      slug !== undefined &&
      slug !== null &&
      (typeof slug !== "string" || !slug.trim())
    ) {
      return res.status(400).json({
        message: "Slug must be a non-empty string or null.",
      });
    }

    const fields = {};

    if (title !== undefined) fields.title = title.trim();
    if (slug !== undefined) {
      fields.slug =
        slug === null ? null : slug.trim().toLowerCase();
    }
    if (body !== undefined) fields.body = body.trim();
    if (content_type !== undefined) {
      fields.content_type = content_type;
    }
    if (status !== undefined) fields.status = status;

    const content = await updateContent(id, fields);

    return res.status(200).json({
      message: "Content updated successfully.",
      content,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "That slug is already in use.",
      });
    }

    console.error("Update content error:", error.message);

    return res.status(500).json({
      message: "Unable to update content.",
    });
  }
};

// Delete content owned by the author or an administrator
const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid content ID.",
      });
    }

    const existing = await getContentById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Content not found.",
      });
    }

    if (
      existing.author_id !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You cannot delete this content.",
      });
    }

    await deleteContent(id);

    return res.status(200).json({
      message: "Content deleted successfully.",
    });
  } catch (error) {
    console.error("Delete content error:", error.message);

    return res.status(500).json({
      message: "Unable to delete content.",
    });
  }
};
// A logged-in user can retrieve only their own submissions
module.exports = {
  create,
  listPublished,
  listMySubmissions,
  listForAdminReview,
  getOne,
  update,
  remove,
};