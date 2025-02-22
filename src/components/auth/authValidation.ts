
import { passwordRequirements } from './PasswordRequirements';

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validatePassword = (password: string): boolean => {
  return passwordRequirements.every(req => req.validator(password));
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export interface FormData {
  email: string;
  password: string;
}

export const validateForm = (
  formData: FormData,
  isRegistering: boolean
): { isValid: boolean; error?: string } => {
  const sanitizedEmail = sanitizeInput(formData.email);
  const sanitizedPassword = sanitizeInput(formData.password);

  if (!sanitizedEmail || !sanitizedPassword) {
    return { isValid: false, error: 'Please fill in all fields' };
  }

  if (!validateEmail(sanitizedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (isRegistering && !validatePassword(sanitizedPassword)) {
    return { isValid: false, error: 'Please meet all password requirements' };
  }

  return { isValid: true };
};
