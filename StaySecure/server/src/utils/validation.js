const EMAIL_REGEX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*$/;

const normalizeEmail = (value = '') => {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
};

const isValidEmail = (value = '') => {
  if (typeof value !== 'string') return false;
  return EMAIL_REGEX.test(normalizeEmail(value));
};

const sanitizeText = (value) => {
  if (value === null || value === undefined) return '';

  return String(value)
    .trim()
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, ' $1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const validatePassword = (password) => {
  if (typeof password !== 'string') return false;

  const trimmed = password.trim();
  if (trimmed.length < 12) return false;
  if (!/[A-Z]/.test(trimmed)) return false;
  if (!/[a-z]/.test(trimmed)) return false;
  if (!/[0-9]/.test(trimmed)) return false;
  if (!/[^A-Za-z0-9]/.test(trimmed)) return false;

  return true;
};

module.exports = {
  EMAIL_REGEX,
  normalizeEmail,
  isValidEmail,
  sanitizeText,
  validatePassword,
};
