// Regex constants matching identical server-side rules
export const NAME_REGEX = /^[a-zA-Z\s.'-]{2,50}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const INDIAN_VEHICLE_REGEX = /^[A-Z]{2}[\s-]?\d{1,2}[\s-]?[A-Z]{1,3}[\s-]?\d{4}$/i;
export const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
export const LOT_NAME_REGEX = /^[a-zA-Z0-9\s.'-]{2,100}$/;
export const CITY_REGEX = /^[a-zA-Z0-9\s.'-]{2,50}$/;

// Validate user's full name
export const validateName = (name) => {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { isValid: false, message: 'Name can only contain letters and spaces' };
  }
  if (!NAME_REGEX.test(trimmed)) {
    return { isValid: false, message: 'Name can only contain letters and spaces' };
  }
  return { isValid: true, message: '' };
};

// Validate email address format
export const validateEmail = (email) => {
  const trimmed = (email || '').trim().toLowerCase();
  if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid email like name@example.com' };
  }
  return { isValid: true, message: '' };
};

// Format vehicle plate as user types (auto-uppercase and remove illegal characters)
export const formatVehicleNumber = (val) => {
  if (!val) return '';
  return val.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
};

// Validate Indian vehicle registration number
export const validateVehicleNumber = (vehicleNumber, isRequired = false) => {
  const trimmed = (vehicleNumber || '').trim();
  if (!trimmed) {
    if (isRequired) {
      return { isValid: false, message: 'Enter a valid vehicle number like KA01AB1234' };
    }
    return { isValid: true, message: '' };
  }

  if (!INDIAN_VEHICLE_REGEX.test(trimmed)) {
    return { isValid: false, message: 'Enter a valid vehicle number like KA01AB1234' };
  }
  return { isValid: true, message: '' };
};

// Calculate password strength indicator
export const getPasswordStrength = (password) => {
  if (!password) return { label: 'Empty', score: 0, color: 'text-slate-400' };
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isLengthValid = password.length >= 8;

  if (isLengthValid && hasLetter && hasNumber && hasSpecial && password.length >= 10) {
    return { label: 'Strong', score: 3, color: 'text-emerald-500' };
  }
  if (isLengthValid && hasLetter && hasNumber) {
    return { label: 'Medium', score: 2, color: 'text-amber-500' };
  }
  return { label: 'Weak', score: 1, color: 'text-red-500' };
};

// Validate password requirements
export const validatePassword = (password) => {
  if (!password || !PASSWORD_REGEX.test(password)) {
    return { isValid: false, message: 'Use at least 8 characters with a letter and a number' };
  }
  return { isValid: true, message: '' };
};

// Validate Admin Parking Lot Form fields
export const validateAdminLot = (formData) => {
  const errors = {};

  // Name
  const nameTrimmed = (formData.name || '').trim();
  if (!nameTrimmed || !LOT_NAME_REGEX.test(nameTrimmed)) {
    errors.name = 'Name can only contain letters, numbers and spaces';
  }

  // City
  const cityTrimmed = (formData.city || '').trim();
  if (!cityTrimmed || !CITY_REGEX.test(cityTrimmed)) {
    errors.city = 'City can only contain letters, numbers and spaces';
  }

  // Address
  if (!formData.address || !formData.address.trim()) {
    errors.address = 'Address is required';
  }

  // Price per hour
  const price = Number(formData.pricePerHour);
  if (!Number.isInteger(price) || price < 1 || price > 10000) {
    errors.pricePerHour = 'Price per hour must be a whole number between 1 and 10000';
  }

  // Total slots
  const slots = Number(formData.totalSlots);
  if (formData.totalSlots !== undefined && formData.totalSlots !== '' && (!Number.isInteger(slots) || slots < 1 || slots > 500)) {
    errors.totalSlots = 'Total slots must be a whole number between 1 and 500';
  }

  // Latitude
  const lat = Number(formData.lat);
  if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.lat = 'Latitude must be between -90 and 90';
  }

  // Longitude
  const lng = Number(formData.lng);
  if (isNaN(lng) || lng < -180 || lng > 180) {
    errors.lng = 'Longitude must be between -180 and 180';
  }

  // Operating Hours
  const openTime = formData.openTime || '';
  const closeTime = formData.closeTime || '';
  if (!openTime || !closeTime || openTime >= closeTime) {
    errors.closeTime = 'Opening time must be before closing time';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
