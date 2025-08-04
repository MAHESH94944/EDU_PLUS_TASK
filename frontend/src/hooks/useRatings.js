import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useRatings = () => {
  return useQuery({
    queryKey: ["ratings"],
    queryFn: async () => {
      const res = await api.get("/api/store-owner/ratings");
      return res.data;
    },
  });
};
