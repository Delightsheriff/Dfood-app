import { dataService } from "@/services/data.service";
import { UpdateProfileRequest } from "@/types/api";
import { ErrorResponse } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => dataService.updateProfile(data),
    onSuccess: (response) => {
      // Update profile cache
      queryClient.setQueryData(["profile"], response);

      // Update session cache with new user data
      queryClient.setQueryData(["session"], {
        success: true,
        data: {
          user: {
            id: response.data.profile.id,
            name: response.data.profile.name,
            email: response.data.profile.email,
            role: response.data.profile.role,
          },
        },
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Profile update failed:", error.response?.data);
    },
  });
}

export function useUpdateProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageFile: FormData) =>
      dataService.updateProfileImage(imageFile),
    onSuccess: (response) => {
      queryClient.setQueryData(["profile"], response);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Profile image update failed:", error.response?.data);
    },
  });
}

export function useDeleteProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dataService.deleteProfileImage(),
    onSuccess: (response) => {
      queryClient.setQueryData(["profile"], response);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Profile image deletion failed:", error.response?.data);
    },
  });
}
