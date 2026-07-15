import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db';
import {
  RegisterPatientInput,
  RegisterDoctorInput,
  LoginInput,
  UserPublic,
  JwtPayload,
  Language,
} from '@swasthconnect/shared';

// BCRYPT cost factor is 10 as specified by the prompt
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Formats a Prisma User model into the public UserPublic interface.
 */
export function formatUserPublic(user: {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR';
  preferred_language: Language;
  created_at: Date;
}): UserPublic {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferred_language: user.preferred_language as Language,
    created_at: user.created_at.toISOString(),
  };
}

/**
 * Generates a signed JWT token for the user.
 */
export function generateToken(user: {
  id: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR';
  name: string;
  preferred_language: Language;
}): string {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    preferred_language: user.preferred_language as Language,
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });
}

export const authService = {
  /**
   * Registers a new PATIENT user.
   */
  registerPatient: async (
    data: RegisterPatientInput
  ): Promise<{ token: string; user: UserPublic }> => {
    // 1. Check if email is already registered
    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // 2. Hash password with bcrypt cost factor 10
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

    // 3. Create Patient User row
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        role: 'PATIENT',
        preferred_language: data.preferred_language,
        age: data.age,
        gender: data.gender,
        blood_group: data.blood_group || null,
      },
    });

    // 4. Generate token and return
    const token = generateToken(user as any);
    return {
      token,
      user: formatUserPublic(user as any),
    };
  },

  /**
   * Registers a new DOCTOR user (atomically creates user & doctor_profiles).
   */
  registerDoctor: async (
    data: RegisterDoctorInput
  ): Promise<{ token: string; user: UserPublic }> => {
    // 1. Check email uniqueness
    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // 2. Check license number uniqueness
    const existingProfile = await db.doctorProfile.findUnique({
      where: { license_number: data.license_number },
    });
    if (existingProfile) {
      throw new Error('License number already registered');
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

    // 4. Run database insertions inside a transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          password_hash: passwordHash,
          role: 'DOCTOR',
          preferred_language: (data as any).preferred_language || 'en',
        },
      });

      await tx.doctorProfile.create({
        data: {
          user_id: newUser.id,
          specialisation: data.specialisation,
          bio: data.bio || null,
          experience_years: data.experience_years,
          consultation_fee: data.consultation_fee,
          license_number: data.license_number,
        },
      });

      return newUser;
    });

    // 5. Generate token and return
    const token = generateToken(user as any);
    return {
      token,
      user: formatUserPublic(user as any),
    };
  },

  /**
   * Logins an existing user.
   */
  login: async (
    data: LoginInput
  ): Promise<{ token: string; user: UserPublic }> => {
    // 1. Retrieve user by email
    const user = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. Compare password hashes
    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 3. Generate token and return
    const token = generateToken(user as any);
    return {
      token,
      user: formatUserPublic(user as any),
    };
  },

  /**
   * Fetches fresh user data from DB by ID.
   */
  getUserById: async (id: string): Promise<UserPublic> => {
    const user = await db.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return formatUserPublic(user as any);
  },

  /**
   * Updates user's preferred language in DB.
   */
  updateLanguage: async (id: string, language: Language): Promise<UserPublic> => {
    const user = await db.user.update({
      where: { id },
      data: {
        preferred_language: language,
      },
    });
    return formatUserPublic(user as any);
  },
};
