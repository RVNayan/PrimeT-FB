// src/validations/task.validation.js
import * as yup from 'yup';

export const createTaskValidation = yup.object({
  title: yup.string().required('Title is required').max(200, 'Title too long'),
  description: yup.string().max(1000, 'Description too long'),
  status: yup.string().oneOf(['pending', 'in-progress', 'completed'], 'Invalid status'),
  priority: yup.string().oneOf(['low', 'medium', 'high'], 'Invalid priority'),
  dueDate: yup.date().min(new Date(), 'Due date must be in the future'),
  tags: yup.array().of(yup.string().max(50, 'Tag too long')),
  isPublic: yup.boolean(),
  assignedTo: yup.string().optional() // User ID
});

export const updateTaskValidation = yup.object({
  title: yup.string().max(200, 'Title too long'),
  description: yup.string().max(1000, 'Description too long'),
  status: yup.string().oneOf(['pending', 'in-progress', 'completed'], 'Invalid status'),
  priority: yup.string().oneOf(['low', 'medium', 'high'], 'Invalid priority'),
  dueDate: yup.date(),
  tags: yup.array().of(yup.string().max(50, 'Tag too long')),
  isPublic: yup.boolean(),
  assignedTo: yup.string().optional()
});