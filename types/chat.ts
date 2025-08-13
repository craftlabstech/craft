// AI Coding Assistant types

export interface User {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    framework: string;
    template: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    files: ProjectFile[];
    chats: Chat[];
}

export interface Chat {
    id: string;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    projectId: string | null;
    project?: Project | null;
    messages: ChatMessage[];
}

export interface ChatMessage {
    id: string;
    content: string;
    role: MessageRole;
    type: MessageType;
    metadata: any;
    createdAt: Date;
    chatId: string;
}

export interface ProjectFile {
    id: string;
    path: string;
    content: string;
    language: string;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
}

export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";
export type MessageType = "TEXT" | "CODE" | "PREVIEW" | "ERROR" | "THINKING";

// AI-specific types for future implementation
export interface CodeBlock {
    language: string;
    code: string;
    filename?: string;
    description?: string;
}

export interface AIResponse {
    text?: string;
    code?: CodeBlock[];
    preview?: string; // HTML preview
    thinking?: string;
    error?: string;
}
