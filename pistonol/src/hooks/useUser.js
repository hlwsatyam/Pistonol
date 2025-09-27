import { useQuery } from "@tanstack/react-query";
import axios from "../axiosConfig";

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axios.get("/auth/me");
      return res.data.user;
    },
    staleTime: 5 * 60 * 1000,
  });
};
