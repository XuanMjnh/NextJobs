/**
 * Validate a request section with a Zod schema and keep the parsed value on
 * req.validated. A key can be supplied for validating one route parameter.
 */
export function validate(schema, source = "body", key) {
  return (req, res, next) => {
    try {
      const input = key ? req[source]?.[key] : req[source];
      const parsed = schema.parse(input);

      req.validated ??= {};
      if (key) {
        req.validated[source] ??= {};
        req.validated[source][key] = parsed;
      } else {
        req.validated[source] = parsed;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
