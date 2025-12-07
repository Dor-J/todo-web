// frontend/src/app/models/user-update.dto.ts

import type { UserRole, UserStatus } from './user.model';

export interface UpdateUserDto {
  /** Profile fields */
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;

  /**
   * Role & status updates – typically restricted to admin endpoints.
   */
  roles?: UserRole[];
  status?: UserStatus;

  /**
   * For self-service password change:
   * - backend should verify currentPassword before applying password.
   * - admin flows can ignore currentPassword and only use password.
   */
  currentPassword?: string;
  password?: string;

  /** Same extensibility hook as in model */
  metadata?: Record<string, unknown>;
}
