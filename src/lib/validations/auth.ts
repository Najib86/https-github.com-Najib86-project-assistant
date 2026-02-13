import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["student", "supervisor"]).default("student"),
});

export const plagiarismSchema = z.object({
    text: z.string().min(50, "Text too short for plagiarism check"),
    projectId: z.number().optional(),
});

export const doiSchema = z.object({
    doi: z.string().regex(/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i, "Invalid DOI format"),
});
