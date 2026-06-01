export type StoredUser = {
  id: string;
  name: string;
  surname?: string;
  email: string;
  login?: string;
  password: string;
};

export type AuthSession = {
  email: string;
};
