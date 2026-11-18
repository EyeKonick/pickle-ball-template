/** Field validation for the booking form. Each returns an error message or "" when valid. */

/** Philippine mobile numbers: 09XX XXX XXXX or +63 9XX XXX XXXX (spaces and dashes allowed). */
export const normalizePhMobile = (value: string): string => value.replace(/[\s-]/g, '');

export const validatePhMobile = (value: string): string => {
  const v = normalizePhMobile(value);
  if (!v) return 'Enter your mobile number.';
  return /^(09\d{9}|\+639\d{9})$/.test(v) ? '' : 'Use a Philippine mobile number, like 0917 555 0142 or +63 917 555 0142.';
};

export const validateEmail = (value: string): string => {
  const v = value.trim();
  if (!v) return 'Enter your email address.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Check the email address, like name@example.com.';
};

export const validateName = (value: string): string => {
  const v = value.trim();
  if (!v) return 'Enter your full name.';
  return v.length >= 2 ? '' : 'Enter your full name as it appears on your GCash account.';
};

/** GCash reference numbers are 13 digits (spaces allowed while typing). */
export const normalizeGcashRef = (value: string): string => value.replace(/\s/g, '');

export const validateGcashRef = (value: string): string => {
  const v = normalizeGcashRef(value);
  if (!v) return 'Enter the 13-digit reference number from your GCash receipt.';
  return /^\d{13}$/.test(v) ? '' : `GCash reference numbers have 13 digits. This one has ${v.replace(/\D/g, '').length}.`;
};

export const validateScreenshot = (file: File | undefined, maxMB: number): string => {
  if (!file) return 'Upload a screenshot of your GCash receipt.';
  if (!file.type.startsWith('image/')) return 'Upload an image file (JPG, PNG or WebP).';
  if (file.size > maxMB * 1024 * 1024) return `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${maxMB} MB.`;
  return '';
};
