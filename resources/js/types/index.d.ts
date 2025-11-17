import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Agent {
    id: number;
    name: string;
    description: string;
    user_id: number;
    count: number;
    created_at: string;
    updated_at: string;
    chats: Chat[];
}

export interface Chat {
    id: number;
    description: string;
    agent_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    agent_name: string;
}

export interface Message {
    id: number;
    chat_id: number;
    user_id: number;
    content: string;
    role: "user" | "model";
    created_at: string;
    updated_at: string;
}