import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates that an optional or required route parameter is a valid UUID
 */
export function validateUUIDParam(paramName: string, required: boolean = true) {
  return (req: Request, res: Response, next: NextFunction) => {
    const val = req.params[paramName];
    if (!val) {
      if (required) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: `Missing required parameter: '${paramName}'`,
        });
      }
      return next();
    }

    if (!UUID_REGEX.test(val)) {
      return res.status(400).json({
        error: 'INVALID_PARAMETER',
        message: `Parameter '${paramName}' must be a valid UUID. Received: '${val}'`,
      });
    }

    next();
  };
}

/**
 * Validates request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'VALIDATION_FAILED',
        message: 'Request body failed validation schema',
        details: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      });
    }

    req.body = result.data;
    next();
  };
}
