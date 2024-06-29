export interface UserResponse {
  message: string;
  user: {
    __v: number;
    _id: string;
    createdAt: Date;
    updatedAt?: Date;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
  };
}
