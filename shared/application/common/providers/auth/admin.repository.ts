export interface AdminRepository {
    inviteUser(email: string, options: {
        establishmentId: string;
        invitorId: string;
        redirection: string;
    }): Promise<string>;

    updateUser(userId: string, updates: {
        password?: string;
    }): Promise<void>;
}
