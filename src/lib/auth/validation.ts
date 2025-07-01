import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  remember: z.boolean().optional()
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  token: z.string().min(1, 'Reset token is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .optional(),
  location: z
    .string()
    .max(100, 'Location must be at most 100 characters')
    .optional(),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  steam_id: z
    .string()
    .max(50, 'Steam ID must be at most 50 characters')
    .optional(),
  xbox_gamertag: z
    .string()
    .max(50, 'Xbox Gamertag must be at most 50 characters')
    .optional(),
  psn_id: z
    .string()
    .max(50, 'PSN ID must be at most 50 characters')
    .optional(),
  nintendo_friend_code: z
    .string()
    .max(50, 'Nintendo Friend Code must be at most 50 characters')
    .optional(),
  epic_username: z
    .string()
    .max(50, 'Epic username must be at most 50 characters')
    .optional(),
  gog_username: z
    .string()
    .max(50, 'GOG username must be at most 50 characters')
    .optional()
});

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;