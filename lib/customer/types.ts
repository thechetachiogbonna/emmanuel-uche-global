export type CustomerAccount = {
  id: string;
  name: string;
  email: string; // stored lowercased
  passwordHash: string;
  joined: string; // ISO date
};

export type CustomerSession = { email: string; name: string } | null;
