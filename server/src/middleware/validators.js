const { body, validationResult } = require('express-validator');

// Regex for letters, spaces, and allowed punctuation (e.g. D'Souza, Mary-Ann, St. John)
const NAME_REGEX = /^[a-zA-Z\s.'-]{2,50}$/;

// Indian vehicle plate regex (supports KA01AB1234, KA 01 AB 1234, KA-01-AB-1234)
const INDIAN_VEHICLE_REGEX = /^[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{1,3}[\s-]?\d{4}$/i;

// Password regex: at least 8 characters, with at least 1 letter and 1 number
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

// Alphanumeric, spaces, and standard punctuation for lot names and cities
const ALPHANUMERIC_TEXT_REGEX = /^[a-zA-Z0-9\s.'-]{2,100}$/;
const CITY_REGEX = /^[a-zA-Z0-9\s.'-]{2,50}$/;

// Central validation middleware to format express-validator errors consistently
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const firstMsg = errorList[0].msg;
    const fieldErrors = {};
    errorList.forEach(err => {
      const field = err.path || err.param;
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = err.msg;
      }
    });

    return res.status(400).json({
      success: false,
      message: firstMsg,
      errors: errorList.map(e => e.msg),
      fieldErrors
    });
  }
  next();
};

// User Registration Validation Rules
const validateRegister = [
  body('name')
    .trim()
    .custom((val) => {
      if (!val || !NAME_REGEX.test(val)) {
        throw new Error('Name can only contain letters and spaces');
      }
      return true;
    }),
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please enter a valid email like name@example.com')
    .normalizeEmail(),
  body('password')
    .custom((val) => {
      if (!val || !PASSWORD_REGEX.test(val)) {
        throw new Error('Use at least 8 characters with a letter and a number');
      }
      return true;
    }),
  body('vehicleNumber')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (val && !INDIAN_VEHICLE_REGEX.test(val)) {
        throw new Error('Enter a valid vehicle number like KA01AB1234');
      }
      return true;
    })
    .customSanitizer(val => (val ? val.replace(/[\s-]+/g, '').toUpperCase() : '')),
  handleValidationErrors
];

// User Login Validation Rules
const validateLogin = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please enter a valid email like name@example.com'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// User Profile Update Validation Rules
const validateProfileUpdate = [
  body('name')
    .trim()
    .custom((val) => {
      if (!val || !NAME_REGEX.test(val)) {
        throw new Error('Name can only contain letters and spaces');
      }
      return true;
    }),
  body('vehicleNumber')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (val && !INDIAN_VEHICLE_REGEX.test(val)) {
        throw new Error('Enter a valid vehicle number like KA01AB1234');
      }
      return true;
    })
    .customSanitizer(val => (val ? val.replace(/[\s-]+/g, '').toUpperCase() : '')),
  handleValidationErrors
];

// Change Password Validation Rules
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .custom((val) => {
      if (!val || !PASSWORD_REGEX.test(val)) {
        throw new Error('Use at least 8 characters with a letter and a number');
      }
      return true;
    }),
  handleValidationErrors
];

// Booking Creation Validation Rules
const validateCreateBooking = [
  body('lotId').notEmpty().withMessage('lotId is required'),
  body('slotId').notEmpty().withMessage('slotId is required'),
  body('vehicleNumber')
    .trim()
    .custom((val) => {
      if (!val || !INDIAN_VEHICLE_REGEX.test(val)) {
        throw new Error('Enter a valid vehicle number like KA01AB1234');
      }
      return true;
    })
    .customSanitizer(val => (val ? val.replace(/[\s-]+/g, '').toUpperCase() : '')),
  body('startTime').isISO8601().withMessage('Valid ISO startTime is required'),
  body('endTime').isISO8601().withMessage('Valid ISO endTime is required'),
  handleValidationErrors
];

// Admin ParkingLot Creation & Update Rules
const validateLot = [
  body('name')
    .trim()
    .custom((val) => {
      if (!val || !ALPHANUMERIC_TEXT_REGEX.test(val)) {
        throw new Error('Name can only contain letters, numbers and spaces');
      }
      return true;
    }),
  body('city')
    .trim()
    .custom((val) => {
      if (!val || !CITY_REGEX.test(val)) {
        throw new Error('City can only contain letters, numbers and spaces');
      }
      return true;
    }),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('pricePerHour')
    .custom((val) => {
      const num = Number(val);
      if (!Number.isInteger(num) || num < 1 || num > 10000) {
        throw new Error('Price per hour must be a whole number between 1 and 10000');
      }
      return true;
    }),
  body('totalSlots')
    .optional({ checkFalsy: true })
    .custom((val) => {
      const num = Number(val);
      if (!Number.isInteger(num) || num < 1 || num > 500) {
        throw new Error('Total slots must be a whole number between 1 and 500');
      }
      return true;
    }),
  body('lat')
    .custom((val) => {
      const num = Number(val);
      if (isNaN(num) || num < -90 || num > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),
  body('lng')
    .custom((val) => {
      const num = Number(val);
      if (isNaN(num) || num < -180 || num > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      return true;
    }),
  body('openTime')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Open time must be in HH:MM format'),
  body('closeTime')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Close time must be in HH:MM format')
    .custom((closeTime, { req }) => {
      const openTime = req.body.openTime;
      if (openTime && closeTime && openTime >= closeTime) {
        throw new Error('Opening time must be before closing time');
      }
      return true;
    }),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword,
  validateCreateBooking,
  validateLot
};
