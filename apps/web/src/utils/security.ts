import DOMPurify from 'dompurify';

/**
 * Sanitizes a string to prevent XSS attacks.
 * Should be used before rendering any user-provided content as HTML.
 */
export const sanitize = (content: string): string => {
  return DOMPurify.sanitize(content);
};

/**
 * Safely handles inputs by both sanitizing and validating.
 */
export const safeInput = (input: string): string => {
  if (!input) return '';
  // Trim and remove any potential script tags or malicious HTML
  return DOMPurify.sanitize(input.trim());
};
