import axios from "axios";

export const initQueue = (url: string) => {
  const queue = axios.create({
    baseURL: url,
  });

  return {
    consumeMessage: async () => {
      const response = await queue.get(`/consume`);
      return response.data?.message || null;
    },
    produceMessage: async (message: string) => {
      await queue.post(`/produce`, { message });
    },
  };
};  
