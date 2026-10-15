import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink } from "node:fs/promises";
import { uploadDir } from "../config/env.js";
import { fail } from "../utils/errors.js";
await mkdir(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, randomUUID()),
});
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single("file");
export async function verifyUpload(req, res, next) {
  if (!req.file) fail(400, "Vui lòng chọn tệp");
  try {
    const b = await readFile(req.file.path);
    let ext;
    if (req.params.kind === "resume" && b.subarray(0, 5).toString() === "%PDF-")
      ext = ".pdf";
    if (req.params.kind === "photo" || req.params.kind === "logo") {
      if (
        b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      )
        ext = ".png";
      if (b[0] === 255 && b[1] === 216 && b[2] === 255) ext = ".jpg";
    }
    if (!ext)
      fail(400, "CV phải là PDF; ảnh phải là PNG hoặc JPG (tối đa 5 MB)");
    const { rename } = await import("node:fs/promises");
    await rename(req.file.path, req.file.path + ext);
    req.file.filename += ext;
    req.file.path += ext;
    next();
  } catch (e) {
    await unlink(req.file.path).catch(() => {});
    next(e);
  }
}
