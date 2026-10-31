
const mediaModel = require("../models/mediaModel");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const { randomUUID } = require("crypto");

const validTypes = ["image", "video", "audio", "document"];

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

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith("image/")
      ? "image"
      : file.mimetype.startsWith("video/") ||
          file.mimetype.startsWith("audio/")
        ? "video"
        : "raw";

    const originalName = String(file.originalname || "upload")
      .replace(/^.*[\\/]/, "")
      .normalize("NFKD")
      .replace(/[^\\w.-]/g, "-")
      .replace(/-+/g, "-")
      .slice(-120);
    const uploadOptions = {
      resource_type: resourceType,
      folder: "legacyeducation/media",
      ...(resourceType === "raw"
        ? {
            // Cloudinary raw assets need the extension in public_id.
            public_id: `${Date.now()}-${randomUUID()}-${originalName || "document.bin"}`,
            use_filename: false,
            unique_filename: false,
          }
        : {
            use_filename: true,
            unique_filename: true,
          }),
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
}

function getUserId(req) {
  return req.user?.id ?? req.user?.userId ?? null;
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

    if (req.file.mimetype === "application/pdf" &&
        req.file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return res.status(400).json({
        message: "The selected file does not contain a valid PDF signature.",
      });
    }

    if (!media_type) {
      return res.status(400).json({
        message: "Unsupported file type.",
      });
    }

    const uploadedFile = await uploadToCloudinary(req.file);

    if (!uploadedFile?.secure_url) {
      throw new Error("Cloudinary did not return a secure file URL.");
    }

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication is required to upload media.",
      });
    }

    const media = await mediaModel.createMedia({
      title: title.trim(),
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      media_type,
      file_url: uploadedFile.secure_url,
      thumbnail_url:
        media_type === "image" ? uploadedFile.secure_url : null,
      mime_type: req.file.mimetype,
      file_size_bytes: req.file.size,
      status: "draft",
      uploaded_by: userId,
    });

    return res.status(201).json({
      message:
        "File uploaded successfully to Cloudinary and saved as a draft.",
      media,
    });
  } catch (error) {
    next(error);
  }
}



async function downloadPdf(req, res, next) {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) return res.status(400).json({ message: "Invalid media ID." });

    const media = await mediaModel.getMediaById(id);
    if (!media) return res.status(404).json({ message: "Book not found." });
    if (media.mime_type !== "application/pdf") {
      return res.status(415).json({ message: "This file is not a PDF." });
    }

    const userId = getUserId(req);
    const isOwner = userId !== null && String(media.uploaded_by) === String(userId);
    const isAdmin = req.user?.role === "admin";
    if (media.status !== "published" && !isOwner && !isAdmin) {
      return res.status(403).json({ message: "This book is not publicly available." });
    }

    const sourceUrl = new URL(media.file_url);
    if (sourceUrl.protocol !== "https:" || sourceUrl.hostname !== "res.cloudinary.com") {
      return res.status(502).json({ message: "The stored PDF location is invalid." });
    }

    const upstream = await fetch(sourceUrl, { signal: AbortSignal.timeout(45000) });
    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ message: "The PDF could not be retrieved from file storage." });
    }

    const safeBase = String(media.title || "LegacyEducation-book")
      .normalize("NFKD")
      .replace(/[^\w -]/g, "")
      .trim()
      .replace(/[\s-]+/g, "-")
      .slice(0, 100) || "LegacyEducation-book";
    const filename = safeBase.toLowerCase().endsWith(".pdf") ? safeBase : safeBase + ".pdf";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", media.status === "published" ? "public, max-age=300" : "private, no-store");
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) res.setHeader("Content-Length", contentLength);

    Readable.fromWeb(upstream.body).on("error", next).pipe(res);
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

async function listAllForAdmin(req, res, next) {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can view the media library.",
      });
    }

    const media = await mediaModel.getAllMedia();

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
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
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

    const userId = getUserId(req);
    const isOwner =
      userId !== null &&
      String(media.uploaded_by) === String(userId);
    const isAdmin = req.user?.role === "admin";
    const isPublished = media.status === "published";

    if (!isPublished && !isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to view this media.",
      });
    }

    return res.json({ media });
  } catch (error) {
    next(error);
  }
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

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "A title is required.",
      });
    }

    if (!validTypes.includes(media_type)) {
      return res.status(400).json({
        message: "Invalid media type.",
      });
    }

    if (typeof file_url !== "string" || !file_url.trim()) {
      return res.status(400).json({
        message: "A file URL is required.",
      });
    }

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication is required to create media.",
      });
    }

    const media = await mediaModel.createMedia({
      title: title.trim(),
      description:
        typeof description === "string" ? description.trim() : null,
      media_type,
      file_url: file_url.trim(),
      thumbnail_url: thumbnail_url || null,
      mime_type: mime_type || null,
      file_size_bytes: file_size_bytes ?? null,
      status: "draft",
      uploaded_by: userId,
    });

    return res.status(201).json({
      message: "Media created successfully.",
      media,
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "Invalid media ID.",
      });
    }

    const existingMedia = await mediaModel.getMediaById(id);

    if (!existingMedia) {
      return res.status(404).json({
        message: "Media not found.",
      });
    }

    const userId = getUserId(req);
    const isOwner =
      userId !== null &&
      String(existingMedia.uploaded_by) === String(userId);
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to update this media.",
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

    if (
      media_type !== undefined &&
      !validTypes.includes(media_type)
    ) {
      return res.status(400).json({
        message: "Invalid media type.",
      });
    }

    if (status !== undefined && !["draft", "published"].includes(status)) {
      return res.status(400).json({
        message: "Invalid media status.",
      });
    }

    // Only administrators can publish or unpublish media.
    if (status !== undefined && !isAdmin) {
      return res.status(403).json({
        message: "Only administrators can change media publication status.",
      });
    }

    const fields = {
      title: title === undefined ? undefined : title.trim(),
      description:
        description === undefined
          ? undefined
          : typeof description === "string"
            ? description.trim()
            : null,
      media_type,
      file_url,
      thumbnail_url,
      mime_type,
      file_size_bytes,
      status,
    };

    const media = await mediaModel.updateMedia(id, fields);

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
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "Invalid media ID.",
      });
    }

    const existingMedia = await mediaModel.getMediaById(id);

    if (!existingMedia) {
      return res.status(404).json({
        message: "Media not found.",
      });
    }

    const userId = getUserId(req);
    const isOwner =
      userId !== null &&
      String(existingMedia.uploaded_by) === String(userId);
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to delete this media.",
      });
    }

    // Remove the database record. Cloudinary files are not deleted here.
    const media = await mediaModel.deleteMedia(id);

    return res.json({
      message: "Media deleted successfully.",
      media,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadFile,
  downloadPdf,
  listPublished,
  listAllForAdmin,
  getOne,
  create,
  update,
  remove,
};