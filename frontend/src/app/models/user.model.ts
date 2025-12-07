// frontend/src/app/models/user.model.ts

export type UserRole = 'USER' | 'ADMIN' | 'MANAGER';

export type UserStatus = 'ACTIVE' | 'INVITED' | 'DISABLED' | 'LOCKED';

export interface User {
  /** Stable unique identifier (GUID from .NET) */
  id: string;

  /** Primary login + contact identifier */
  email: string;

  /** Whether the email has been verified (confirmation link, etc.) */
  emailVerified: boolean;

  /** Optional username/handle (can be shown in UI, not required for auth) */
  username?: string | null;

  /** Profile fields */
  firstName?: string | null;
  lastName?: string | null;

  /**
   * Display name to show in UI.
   * Backend should always send this (derived from first/last/username).
   */
  displayName: string;

  /** Optional avatar/profile image */
  avatarUrl?: string | null;

  /** Optional phone (for profile / 2FA later) */
  phoneNumber?: string | null;

  /** Account status: fully active, invited, disabled, or locked */
  status: UserStatus;

  /** Roles for authorization checks in frontend */
  roles: UserRole[];

  /** When the user last successfully logged in */
  lastLoginAt?: string | null;

  /** Audit fields */
  createdAt: string;
  updatedAt?: string | null;

  metadata?: Record<string, unknown>;
}
