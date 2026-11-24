import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    try {
      for (let validation of validations) {
        const result = await validation.run(req);
        if (!result.isEmpty()) {
          break;
        }
      }

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const errorList = errors.array();
      const extractedErrors = errorList.map((err) => ({ [err.path]: err.msg }));
      const firstErrorMessage = errorList[0]?.msg || 'Validation failed';

      // Respond immediately with a clean 400 instead of throwing inside an async
      // middleware (a rejected promise here would surface as an unhandled
      // rejection and could crash the Node process).
      return res.status(400).json({
        success: false,
        message: firstErrorMessage,
        errors: extractedErrors,
      });
    } catch (err) {
      return next(err);
    }
  };
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Please enter a valid email'),
];

export const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

export const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Please enter a valid email'),
];
