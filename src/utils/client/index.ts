import PocketBase from "pocketbase";

export const baseUrl = import.meta.env.BASE_URL;

const client = new PocketBase(baseUrl);

export default client;

export const useAuthModel = () => {
  return client.AuthStore.model as {
    email: string;
    id: string;
  };
};
