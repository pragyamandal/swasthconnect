import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { Language } from '@swasthconnect/shared';

// BCP-47 / Language validation enum
const LanguageEnum = z.enum(['en', 'hi', 'kn', 'ta', 'te', 'bn'], {
  errorMap: () => ({ message: "Language must be one of: 'en', 'hi', 'kn', 'ta', 'te', 'bn'" }),
});

const SpecialisationEnum = z.enum([
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Orthopaedist',
  'Neurologist',
  'Gynaecologist',
  'Paediatrician',
  'Psychiatrist',
  'ENT Specialist',
  'Ophthalmologist',
], {
  errorMap: () => ({ message: 'Invalid medical specialisation recommended' }),
});

// Zod schema for patient registration
const registerPatientSchema = z.object({
  role: z.literal('PATIENT'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  age: z.number({ required_error: 'Age is required' }).int().positive('Age must be a positive integer'),
  gender: z.string().trim().min(1, 'Gender is required'),
  blood_group: z.string().trim().optional(),
  preferred_language: LanguageEnum.default('en'),
});

// Zod schema for doctor registration
const registerDoctorSchema = z.object({
  role: z.literal('DOCTOR'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  specialisation: SpecialisationEnum,
  bio: z.string().trim().optional(),
  experience_years: z
    .number({ required_error: 'Experience years is required' })
    .int()
    .nonnegative('Experience years cannot be negative'),
  consultation_fee: z
    .number({ required_error: 'Consultation fee is required' })
    .int()
    .positive('Consultation fee must be positive'),
  license_number: z.string().trim().min(1, 'License number is required'),
  preferred_language: LanguageEnum.optional().default('en'),
});

// Discriminated union to route validation by role
const registerSchema = z.discriminatedUnion('role', [
  registerPatientSchema,
  registerDoctorSchema,
]);

// Zod schema for login
const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Zod schema for preferred language update
const updateLanguageSchema = z.object({
  preferred_language: LanguageEnum,
});

export const authController = {
  /**
   * Register endpoint
   */
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: result.error.flatten().fieldErrors,
        });
        return;
      }

      const input = result.data;
      let authResponse;

      if (input.role === 'PATIENT') {
        authResponse = await authService.registerPatient(input);
      } else {
        authResponse = await authService.registerDoctor(input);
      }

      res.status(201).json({
        success: true,
        data: authResponse,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  },

  /**
   * Login endpoint
   */
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: result.error.flatten().fieldErrors,
        });
        return;
      }

      const authResponse = await authService.login(result.data);
      res.status(200).json({
        success: true,
        data: authResponse,
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message || 'Login failed',
        });
      }
    }
  },

  /**
   * Get Current User (GET /api/auth/me)
   */
  me: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorised — no user context found',
        });
        return;
      }

      // Fetch fresh user data from DB using JWT payload ID
      const user = await authService.getUserById(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message || 'User not found',
      });
    }
  },

  /**
   * Update preferred language (PATCH /api/users/language)
   */
  updateLanguage: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorised — no user context found',
        });
        return;
      }

      const result = updateLanguageSchema.safeParse(req.body);
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: result.error.flatten().fieldErrors,
        });
        return;
      }

      const updatedUser = await authService.updateLanguage(
        req.user.id,
        result.data.preferred_language as Language
      );

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update preferred language',
      });
    }
  },
};
