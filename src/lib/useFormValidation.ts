import { useState, useCallback } from 'react';

export type ValidationRule = 'required' | 'email' | 'phone' | 'minLength';

export interface ValidationConfig {
  required?: string;
  email?: string;
  phone?: string;
  minLength?: { value: number; message: string };
}

type ValidationErrors = Record<string, string>;

export function useFormValidation(config: Record<string, ValidationConfig>) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback((values: Record<string, string>) => {
    const newErrors: ValidationErrors = {};

    for (const [field, rules] of Object.entries(config)) {
      const value = values[field] ?? '';

      if (rules.required && !value.trim()) {
        newErrors[field] = rules.required;
        continue;
      }

      if (rules.email && value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field] = rules.email;
          continue;
        }
      }

      if (rules.phone && value.trim()) {
        const digits = value.replace(/\D/g, '');
        if (digits.length < 10) {
          newErrors[field] = rules.phone;
          continue;
        }
      }

      if (rules.minLength && value.trim().length < rules.minLength.value) {
        newErrors[field] = rules.minLength.message;
        continue;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config]);

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const getFieldError = useCallback((field: string) => {
    return touched[field] ? errors[field] : undefined;
  }, [touched, errors]);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return { errors, validate, markTouched, getFieldError, reset, touched };
}
