export const USER_ROLES = Object.freeze({
  CANDIDATE: "candidate",
  RECRUITER: "recruiter",
});

export const JOB_STATUSES = Object.freeze({ OPEN: "open", CLOSED: "closed" });

export const JOB_TYPES = Object.freeze({
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
});

export const REMOTE_MODES = Object.freeze({
  REMOTE_ONLY: "Remote-Only",
  OFFICE_ONLY: "Office-Only",
  PARTIAL_REMOTE: "Partial-Remote",
});

export const SKILL_LEVELS = Object.freeze({
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCE: "Advance",
});

export const APPLICATION_STATUSES = Object.freeze({
  PENDING: "pending",
  REVIEWING: "reviewing",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
});

export const SEARCH_DAY_FILTERS = Object.freeze(["", "1", "7", "30"]);
export const PROFILE_UPLOAD_KINDS = Object.freeze(["photo", "resume"]);
export const UPLOAD_KINDS = Object.freeze([...PROFILE_UPLOAD_KINDS, "logo"]);
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const SESSION_COOKIE_NAME = "nextjobs_session";

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
});
