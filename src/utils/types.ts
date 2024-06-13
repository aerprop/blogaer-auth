export type LoginReqBody = {
  username: string;
  email: string;
  password?: string;
  picture?: string;
  verified?: boolean;
};