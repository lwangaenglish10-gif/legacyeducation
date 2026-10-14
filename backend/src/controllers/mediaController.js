
const mediaModel = require("../models/mediaModel");

const validTypes = ["image", "video", "audio", "document"];
const validStatuses = ["draft", "published"];

const mediaTypeByMime = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "audio/ogg": "audio",
  "application/pdf": "document",
  "text/plain": "document",
  "application/msword": "document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "document",
  "application/vnd.ms-powerpoint": "document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "document",
};

function isAdmin(user) {
  return user?.role === "admin";
}

async function create(req, res, next) {
  try {
    const {
      title,
      description,
      media_type,
      file_url,
      thumbnail_url,
      mime_type,
      file_size_bytes,
      status,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      !media_type ||
      typeof file_url !== "string" ||
      !file_url.trim()
    ) {
      return res.status(400).json({
        message: "Title, media type, and file URL are required.",
      });
    }

    if (!validTypes.includes(media_type)) {
      return res.status(400).json({
        message: "Invalid media type.",
      });
    }

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid media status.",
      });
    }

    if (
      file_size_bytes !== undefined &&
      file_size_bytes !== null &&
      (!Number.isSafeInteger(file_size_bytes) || file_size_bytes < 0)
    ) {
      return res.status(400).json({
        message: "File size must be a non-negative integer.",
      });
    }

    const media = await mediaModel.createMedia({
      title: title.trim(),
      description,
      media_type,
      file_url: file_url.trim(),
      thumbnail_url,
      mime_type,
      file_size_bytes,
      status: isAdmin(req.user) ? (status || "draft") : "draft",
      uploaded_by: req.user.id,
    });

    return res.status(201).json({
      message: "Media record created successfully.",
      media,
    });
  } catch (error) {
    next(error);
  }
}

async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file to upload.",
      });
    }

    const { title, description } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "A title is required for the uploaded file.",
      });
    }

    const media_type = mediaTypeByMime[req.file.mimetype];

    if (!media_type) {
      return res.status(400).json({
        message: "Unsupported file type.",
      });
    }

    const media = await mediaModel.createMedia({
      title: title.trim(),
      description:
        typeof description === "string" ? description.trim() : null,
      media_type,
      file_url: `/api/media/files/${req.file.filename}`,
      mime_type: req.file.mimetype,
      file_size_bytes: req.file.size,
      status: "draft",
      uploaded_by: req.user.id,
    });

    return res.status(201).json({
      message: "File uploaded successfully. It is saved as a draft.",
      media,
    });
  } catch (error) {
    next(error);
  }
}

async function listPublished(req, res, next) {
  try {
    const { type } = req.query;

    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid media type filter.",
      });
    }

    const media = await mediaModel.getPublishedMedia({ type });

    return res.json({
      count: media.length,
      media,
    });
  } catch (error) {
    next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid media ID.",
      });
    }

    const media = await mediaModel.getMediaById(id);

    if (!media) {
      return res.status(404).json({
        message: "Media not found.",
      });
    }
console.log("DEBUG media record:", media);
console.log("DEBUG authenticated user:", req.user);
    if (
      media.status !== "published" &&
      media.uploaded_by !== req.user?.id &&
      !isAdmin(req.user)
    ) {
      return res.status(404).json({
        message: "Media not found.",
      });
    }

    return res.json({ media });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid media ID.",
      });
    }

    const existing = await mediaModel.getMediaById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Media not found.",
      });
    }

    if (existing.uploaded_by !== req.user.id && !isAdmin(req.user)) {
      return res.status(403).json({
        message: "You cannot edit this media.",
      });
    }

    const {
      title,
      description,
      media_type,
      file_url,
      thumbnail_url,
      mime_type,
      file_size_bytes,
      status,
    } = req.body;

    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      return res.status(400).json({
        message: "Title cannot be empty.",
      });
    }

    if (media_type !== undefined && !validTypes.includes(media_type)) {
      return res.status(400).json({
        message: "Invalid media type.",
      });
    }

    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid media status.",
      });
    }

    if (
      file_size_bytes !== undefined &&
      file_size_bytes !== null &&
      (!Number.isSafeInteger(file_size_bytes) || file_size_bytes < 0)
    ) {
      return res.status(400).json({
        message: "File size must be a non-negative integer.",
      });
    }

    if (
      file_url !== undefined &&
      (typeof file_url !== "string" || !file_url.trim())
    ) {
      return res.status(400).json({
        message: "File URL cannot be empty.",
      });
    }

    const changes = {
      title: title === undefined ? undefined : title.trim(),
      description,
      media_type,
      file_url: file_url === undefined ? undefined : file_url.trim(),
      thumbnail_url,
      mime_type,
      file_size_bytes,
      status: isAdmin(req.user)
        ? status
        : status === "published"
          ? undefined
          : status,
    };

    const media = await mediaModel.updateMedia(id, changes);

    return res.json({
      message: "Media updated successfully.",
      media,
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid media ID.",
      });
    }

    const existing = await mediaModel.getMediaById(id);

    if (!existing) {
      return res.status(404).json({
        message: "Media not found.",
      });
    }

    if (existing.uploaded_by !== req.user.id && !isAdmin(req.user)) {
      return res.status(403).json({
        message: "You cannot delete this media.",
      });
    }

    await mediaModel.deleteMedia(id);

    return res.json({
      message: "Media deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  uploadFile,
  listPublished,
  getOne,
  update,
  remove,
};
