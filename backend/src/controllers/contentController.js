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

// Create a story or article. Non-admin submissions always start as drafts.
const create = async (req, res) => {
  try {
    const { title, slug, body, content_type, status } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 200 ||
      typeof body !== "string" ||
      !body.trim() ||
      body.length > 1000000
    ) {
      return res.status(400).json({
        message: "Title and body are required and must be within the allowed length.",
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
        ? slug.trim().toLowerCase().slice(0, 250)
        : null;

    const content = await createContent({
      title: cleanTitle,
      slug: cleanSlug,
      body: body.trim(),
      content_type,
      author_id: req.user.id,
      status: req.user.role === "admin" ? status || "draft" : "draft",
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
    return res.status(500).json({ message: "Unable to create content." });
  }
};

const listPublished = async (req, res) => {
  try {
    const { type } = req.query;

    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ message: "Type must be story or article." });
    }

    const content = await getPublishedContent(type || null);
    return res.status(200).json({ count: content.length, content });
  } catch (error) {
    console.error("List content error:", error.message);
    return res.status(500).json({ message: "Unable to retrieve content." });
  }
};

const listMySubmissions = async (req, res) => {
  try {
    const content = await getContentByAuthor(req.user.id);
    return res.status(200).json({ count: content.length, content });
  } catch (error) {
    console.error("List own submissions error:", error.message);
    return res.status(500).json({ message: "Unable to retrieve your submissions." });
  }
};

const listForAdminReview = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only administrators can review submissions." });
  }

  try {
    const content = await getContentForReview();
    return res.status(200).json({ count: content.length, content });
  } catch (error) {
    console.error("Admin review list error:", error.message);
    return res.status(500).json({ message: "Unable to retrieve articles for review." });
  }
};

const getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid content ID." });
    }

    const content = await getContentById(id);

    if (!content || content.status !== "published") {
      return res.status(404).json({ message: "Content not found." });
    }

    return res.status(200).json({ content });
  } catch (error) {
    console.error("Get content error:", error.message);
    return res.status(500).json({ message: "Unable to retrieve content." });
  }
};

const update = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid content ID." });
    }

    const existing = await getContentById(id);
    if (!existing) return res.status(404).json({ message: "Content not found." });

    const isAdmin = req.user.role === "admin";
    const isOwner = existing.author_id === req.user.id;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You cannot edit this content." });
    }

    // Once content is published, the administrator has final control over it.
    if (!isAdmin && existing.status === "published") {
      return res.status(403).json({
        message: "Published content can only be changed by an administrator.",
      });
    }

    const { title, slug, body, content_type, status } = req.body;

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim() || title.trim().length > 200)
    ) {
      return res.status(400).json({ message: "Title must be valid and 200 characters or fewer." });
    }

    if (
      body !== undefined &&
      (typeof body !== "string" || !body.trim() || body.length > 1000000)
    ) {
      return res.status(400).json({ message: "Body must be valid and within the allowed length." });
    }

    if (content_type !== undefined && !validTypes.includes(content_type)) {
      return res.status(400).json({ message: "Content type must be story or article." });
    }

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status must be draft or published." });
    }

    if (status !== undefined && !isAdmin) {
      return res.status(403).json({ message: "Only administrators can change publication status." });
    }

    if (
      slug !== undefined &&
      slug !== null &&
      (typeof slug !== "string" || !slug.trim() || slug.trim().length > 250)
    ) {
      return res.status(400).json({ message: "Slug must be a valid string or null." });
    }

    const fields = {};
    if (title !== undefined) fields.title = title.trim();
    if (slug !== undefined) fields.slug = slug === null ? null : slug.trim().toLowerCase();
    if (body !== undefined) fields.body = body.trim();
    if (content_type !== undefined) fields.content_type = content_type;
    if (status !== undefined) fields.status = status;

    const content = await updateContent(id, fields);
    return res.status(200).json({ message: "Content updated successfully.", content });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "That slug is already in use." });
    }

    console.error("Update content error:", error.message);
    return res.status(500).json({ message: "Unable to update content." });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid content ID." });
    }

    const existing = await getContentById(id);
    if (!existing) return res.status(404).json({ message: "Content not found." });

    const isAdmin = req.user.role === "admin";
    const isOwner = existing.author_id === req.user.id;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You cannot delete this content." });
    }

    // Authors may remove their own drafts, but published material remains under administrator control.
    if (!isAdmin && existing.status === "published") {
      return res.status(403).json({
        message: "Published content can only be deleted by an administrator.",
      });
    }

    await deleteContent(id);
    return res.status(200).json({ message: "Content deleted successfully." });
  } catch (error) {
    console.error("Delete content error:", error.message);
    return res.status(500).json({ message: "Unable to delete content." });
  }
};

module.exports = {
  create,
  listPublished,
  listMySubmissions,
  listForAdminReview,
  getOne,
  update,
  remove,
};
