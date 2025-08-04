import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

// Fetch users
export const useUsers = (filters = {}, page = 1) => {
  return useQuery({
    queryKey: ["admin-users", filters, page],
    queryFn: async () => {
      const res = await api.get("/api/admin/users", {
        params: { ...filters, page, limit: 10 },
      });
      return res.data;
    },
  });
};

// Add user
export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => api.post("/api/admin/users", user),
    onSuccess: () => queryClient.invalidateQueries(["admin-users"]),
  });
};

// Edit user
export const useEditUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => api.put(`/api/admin/users/${user.id}`, user),
    onSuccess: () => queryClient.invalidateQueries(["admin-users"]),
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.delete(`/api/admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["admin-users"]),
  });
};
