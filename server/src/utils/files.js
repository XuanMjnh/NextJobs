import path from "node:path";
import { uploadDir } from "../config/env.js";
export const filePath = (name) => path.join(uploadDir, path.basename(name));
