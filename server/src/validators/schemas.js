import { z } from "zod";
import {
  APPLICATION_STATUSES,
  JOB_STATUSES,
  JOB_TYPES,
  REMOTE_MODES,
  SEARCH_DAY_FILTERS,
  SKILL_LEVELS,
  USER_ROLES,
} from "../constants/index.js";

const text = (max = 200) => z.string().trim().max(max);
const required = (max = 200) => text(max).min(1, "Không được để trống");

export const credentials = z.object({
  email: z
    .email()
    .max(190)
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(10, "Mật khẩu tối thiểu 10 ký tự")
    .max(72)
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= 72,
      "Mật khẩu tối đa 72 byte UTF-8",
    ),
});

export const register = credentials.extend({
  role: z.enum(Object.values(USER_ROLES)),
});

export const login = z.object({
  email: z
    .email()
    .max(190)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(72),
});

export const profile = z.object({
  first_name: text(100),
  last_name: text(100),
  city: text(),
  state: text(),
  country: text(),
  company: text(),
  certificate: text(),
  experience: text(1000),
  skills: z
    .array(
      z.object({
        name: required(100),
        level: z.enum(Object.values(SKILL_LEVELS)),
        years: z.coerce.number().min(0).max(99),
      }),
    )
    .max(30),
});

export const job = z.object({
  title: required(),
  company: required(),
  city: required(),
  state: text().default(""),
  country: required().default("Việt Nam"),
  type: z.enum(Object.values(JOB_TYPES)),
  remote: z.enum(Object.values(REMOTE_MODES)),
  salary: required(100),
  quantity: z.coerce.number().int().min(1).max(10000),
  field: text().default(""),
  experience_required: text().default(""),
  certificate_required: text().default(""),
  description: required(10000),
  status: z.enum(Object.values(JOB_STATUSES)).default(JOB_STATUSES.OPEN),
});

export const search = z.object({
  q: text().default(""),
  location: text().default(""),
  types: z.string().default(""),
  remotes: z.string().default(""),
  days: z.enum(SEARCH_DAY_FILTERS).default(""),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const application = z.object({
  cover_letter: text(5000).default(""),
});

export const applicationStatus = z.object({
  status: z.enum([
    APPLICATION_STATUSES.PENDING,
    APPLICATION_STATUSES.REVIEWING,
    APPLICATION_STATUSES.ACCEPTED,
    APPLICATION_STATUSES.REJECTED,
  ]),
});

export const id = z.coerce.number().int().positive();
