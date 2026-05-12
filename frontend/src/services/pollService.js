import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const pollService = {
  createPoll: async (pollData, getToken) => {
    try {
      const token = await getToken();
      const response = await api.post("/create", pollData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || "Failed to create poll"
      );
    }
  },

  getPoll: async (pollId) => {
    try {
      const response = await api.get(`/${pollId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || "Failed to fetch poll"
      );
    }
  },

  submitVote: async (pollId, voteData, getToken) => {
    try {
      let headers = {};
      if (getToken) {
        const token = await getToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }
      const response = await api.post(`/${pollId}/vote`, voteData, { headers });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || "Failed to submit vote"
      );
    }
  },

  getCreatorPolls: async (getToken) => {
    try {
      const token = await getToken();
      const response = await api.get("/creator-polls", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch polls");
    }
  },

  getPollAnalytics: async (pollId, getToken) => {
    try {
      let headers = {};
      if (getToken) {
        const token = await getToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }
      const response = await api.get(`/${pollId}/analytics`, { headers });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch analytics");
    }
  },

  publishPoll: async (pollId, getToken) => {
    try {
      const token = await getToken();
      const response = await api.post(`/${pollId}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to publish poll");
    }
  },

  getPublishedPolls: async (search = "") => {
    try {
      const response = await api.get(`/published?search=${encodeURIComponent(search)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch community polls");
    }
  },

  closePoll: async (pollId, getToken) => {
    try {
      const token = await getToken();
      const response = await api.post(`/${pollId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to close poll");
    }
  }
};
