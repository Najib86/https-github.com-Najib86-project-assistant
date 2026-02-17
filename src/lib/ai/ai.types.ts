export interface AIProvider {
    name: string;
    isEnabled(): boolean;
    generate(prompt: string): Promise<string>;
}

export interface AIError {
    provider: string;
    error: string;
}

export interface AIResponse {
    success: boolean;
    content: string;
    provider?: string;
    error?: string;
}
