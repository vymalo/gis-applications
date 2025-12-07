import { z } from 'zod';

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const userRoleValues = Object.values(UserRole) as UserRole[];

export const UserRoleSchema = z.enum(userRoleValues);
