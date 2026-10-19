export class AppError extends Error {
  constructor(status, message, options = {}) {
    super(message, options);
    this.name = "AppError";
    this.status = status;
  }
}

export const fail = (status, message) => {
  throw new AppError(status, message);
};
