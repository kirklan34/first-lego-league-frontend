import type { AuthStrategy } from "@/lib/authProvider";
import { User } from "@/types/user";
import { fetchHalCollection, fetchHalResource, createHalResource } from "./halClient";

export class UsersService {
    constructor(private readonly authStrategy: AuthStrategy) {
    }

    async getUsers(): Promise<User[]> {
        return fetchHalCollection<User>('/users', this.authStrategy, 'users');
    }

    async getUserById(id: string): Promise<User> {
        return fetchHalResource<User>(`/users/${id}`, this.authStrategy);
    }

    async getCurrentUser(): Promise<User | null> {
        if (!await this.authStrategy.getAuth()) {
            return null;
        }
        return fetchHalResource<User>('/identity', this.authStrategy);
    }

    async createUser(user: User): Promise<User> {
        return createHalResource<User>('/users', user, this.authStrategy, 'user');
    }
}
