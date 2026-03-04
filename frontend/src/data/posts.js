import api from "../lib/api";

export const fetchPosts = async () => {
  try {
    const { data } = await api.get("/posts");
    return data;
  } catch (error) {
    throw new Error("Failed to fetch posts");
  }
};
