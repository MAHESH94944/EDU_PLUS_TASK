import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

// Fetch stores
export const useStores = (search = "", sort = "desc") => {
  return useQuery({
    queryKey: ["stores", search, sort],
    queryFn: async () => {
      const params = {};
      if (search) params.q = search;
      const res = await api.get("/api/user/stores", { params });
      let stores = res.data;
      if (sort === "asc") {
        stores = stores.sort(
          (a, b) => (a.overallRating || 0) - (b.overallRating || 0)
        );
      } else if (sort === "desc") {
        stores = stores.sort(
          (a, b) => (b.overallRating || 0) - (a.overallRating || 0)
        );
      }
      return stores;
    },
  });
};

// Submit/update rating (optimistic update)
export const useRateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, rating }) =>
      api.post(`/api/user/stores/${storeId}/rate`, { rating }),
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
    },
  });
};
