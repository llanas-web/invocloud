import type { AvatarProps } from "@nuxt/ui";

export interface Mail {
    id: number;
    unread?: boolean;
    from: User;
    subject: string;
    body: string;
    date: string;
}

export interface Member {
    name: string;
    username: string;
    role: "member" | "owner";
    avatar: Avatar;
}

export interface Stat {
    title: string;
    icon: string;
    value: number | string;
    variation: number;
    formatter?: (value: number) => string;
}

export interface Sale {
    id: string;
    date: string;
    status: SaleStatus;
    email: string;
    amount: number;
}

export interface Notification {
    id: number;
    unread?: boolean;
    sender: User;
    body: string;
    date: string;
}

export type Period = "journalier" | "hebdomadaire" | "mensuel";

export interface Range {
    start: Date;
    end: Date;
}
