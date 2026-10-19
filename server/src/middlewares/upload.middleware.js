import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink } from "node:fs/promises";
import { uploadDir } from "../config/env.js";
import { MAX_UPLOAD_SIZE_BYTES } from "../constants/index.js";
import { fail } from "../utils/appError.js";

await mkdir(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, callback) => callback(null, randomUUID()),
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES, files: 1 },
}).single("file");

export async function verifyUpload(req, res, next) {
  if (!req.file) return fail(400, "Vui lòng chọn tệp");

  try {
    const buffer = await readFile(req.file.path);
    let extension;

    if (
      req.params.kind === "resume" &&
      buffer.subarray(0, 5).toString() === "%PDF-"
    ) {
      extension = ".pdf";
    }

    if (req.params.kind === "photo" || req.params.kind === "logo") {
      const isPng = buffer
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const isJpeg =
        buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
      if (isPng) extension = ".png";
      if (isJpeg) extension = ".jpg";
    }

    if (!extension)
      fail(400, "CV phải là PDF; ảnh phải là PNG hoặc JPG (tối đa 5 MB)");

    await rename(req.file.path, `${req.file.path}${extension}`);
    req.file.filename += extension;
    req.file.path += extension;
    return next();
  } catch (error) {
    await unlink(req.file.path).catch(() => {});
    return next(error);
  }
}
