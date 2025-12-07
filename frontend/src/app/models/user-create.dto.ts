// frontend/src/app/models/user-create.dto.ts

import type { UserRole, UserStatus } from './user.model';

export interface CreateUserDto {
  /** Required for any account */
  email: string;

  /**
   * Plain password sent once at creation.
   * Backend must hash & never return it.
   */
  password: string;

  /**
   * Optional frontend-only confirm; backend can validate
   * or you can handle it purely client-side.
   */
  confirmPassword?: string;

  /** Optional profile fields */
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;

  /**
   * Optional, backend should default to ['USER'] if omitted.
   * For self-registration: ignore on server or force ['USER'].
   */
  roles?: UserRole[];

  /**
   * Optional initial status.
   * For self-registration usually 'ACTIVE' or 'INVITED'.
   * For admin-created accounts: often 'INVITED'.
   */
  status?: UserStatus;

  /** Open-ended extension point */
  metadata?: Record<string, unknown>;
}
