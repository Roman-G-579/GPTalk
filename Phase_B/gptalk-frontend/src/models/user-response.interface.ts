export interface UserResponse {
    __v: number;
    _id: string;
    createdAt: Date;
    updatedAt?: Date;
    email: string;
    username: string;
    userAvatar: string;
    firstName: string;
    lastName: string;
    totalExp: number;
}
