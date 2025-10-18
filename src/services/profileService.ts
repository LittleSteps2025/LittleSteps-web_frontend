// API service for user profile operations

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

import { API_BASE_URL } from "../config/api";

export const profileService = {
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.email) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/supervisors/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-User-Email": user.email,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to change password");
      }

      return {
        success: true,
        message: result.message || "Password changed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while changing password",
      };
    }
  },
};
