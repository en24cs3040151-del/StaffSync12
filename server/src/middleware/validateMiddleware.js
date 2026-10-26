import { validationResult } from 'express-validator';
import { sendError } from '../utils/responseHelper.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return sendError(res, 'Validation failed', 422, formattedErrors);
  }
  next();
};
