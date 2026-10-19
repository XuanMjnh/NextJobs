function write(level, message, details) {
  const prefix = `[${new Date().toISOString()}] ${level.toUpperCase()}`;
  const output = level === "error" ? console.error : console.log;

  if (details === undefined) output(`${prefix} ${message}`);
  else output(`${prefix} ${message}`, details);
}

export const logger = Object.freeze({
  info: (message, details) => write("info", message, details),
  warn: (message, details) => write("warn", message, details),
  error: (message, details) => write("error", message, details),
});
