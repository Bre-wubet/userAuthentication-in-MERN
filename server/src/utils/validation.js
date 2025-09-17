const Joi = require('joi');

// Common validation schemas
const emailSchema = Joi.string().email().required();
const passwordSchema = Joi.string().min(8).required();
const usernameSchema = Joi.string().min(3).max(30).required();
const nameSchema = Joi.string().min(2).max(50).allow('').empty('').optional();

// Auth validation schemas
const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required(),
  rememberMe: Joi.boolean().optional(),
});

const registerSchema = Joi.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
});

const forgotPasswordSchema = Joi.object({
  email: emailSchema,
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: passwordSchema,
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema,
});

const updateProfileSchema = Joi.object({
  firstName: nameSchema,
  lastName: nameSchema,
  username: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).allow('').empty('').optional(),
  bio: Joi.string().max(500).allow('').empty('').optional(),
  website: Joi.string().uri().allow('').empty('').optional(),
  location: Joi.string().max(100).allow('').empty('').optional(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).allow('').empty('').optional(),
  birthDate: Joi.alternatives().try(Joi.date(), Joi.string().allow('').empty('')).optional(),
}).custom((value, helpers) => {
  // Normalize empty strings to undefined so the service can ignore them
  const normalized = { ...value };
  Object.keys(normalized).forEach((key) => {
    if (typeof normalized[key] === 'string' && normalized[key].trim() === '') {
      normalized[key] = undefined;
    }
  });
  return normalized;
});

// Role and permission validation schemas
const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(200).optional(),
  permissions: Joi.array().items(Joi.string()).min(1).required(),
});

const updateRoleSchema = createRoleSchema.fork(['name'], (schema) => schema.optional());

const assignRoleSchema = Joi.object({
  userId: Joi.string().required(),
  roleId: Joi.string().required(),
});

// Pagination validation schema
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().optional(),
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: true, stripUnknown: true });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }
    
    req.body = value;
    next();
  };
};

// Query validation middleware
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors: errorMessages,
      });
    }
    
    req.query = value;
    next();
  };
};

module.exports = {
  // Schemas
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  createRoleSchema,
  updateRoleSchema,
  assignRoleSchema,
  paginationSchema,
  
  // Middleware
  validate,
  validateQuery,
};
