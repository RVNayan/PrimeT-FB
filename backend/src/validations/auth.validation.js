// src/validations/auth.validation.js
import * as yup from 'yup';

export const registerValidation = yup.object({
  name: yup.string().required('Name is required').max(50, 'Name too long'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  adminSecret: yup.string().optional() // Only required for admin registration
});

export const loginValidation = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required')
});

export const adminRegisterValidation = yup.object({
  name: yup.string().required('Name is required').max(50, 'Name too long'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  adminSecret: yup.string().required('Admin secret key is required').min(10, 'Invalid admin secret')
});