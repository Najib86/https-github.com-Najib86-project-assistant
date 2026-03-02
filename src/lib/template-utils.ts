import prisma from "@/lib/prisma";

export interface TemplateChapter {
    id: number;
    chapterNumber: number;
    title: string;
    description?: string;
    subsections?: string[];
    wordCount?: number;
    guidelines?: string;
}

export interface ProjectTemplate {
    id: number;
    name: string;
    description?: string;
    type: string;
    content: TemplateChapter[];
    isDefault: boolean;
}

/**
 * Get the default project template
 */
export async function getDefaultTemplate(): Promise<ProjectTemplate | null> {
    const template = await prisma.template.findFirst({
        where: {
            type: 'project',
            isDefault: true
        }
    });

    if (!template) return null;

    return {
        id: template.id,
        name: template.name,
        description: template.description || undefined,
        type: template.type,
        content: template.content as TemplateChapter[],
        isDefault: template.isDefault
    };
}

/**
 * Get a specific template by ID
 */
export async function getTemplateById(templateId: number): Promise<ProjectTemplate | null> {
    const template = await prisma.template.findUnique({
        where: { id: templateId }
    });

    if (!template) return null;

    return {
        id: template.id,
        name: template.name,
        description: template.description || undefined,
        type: template.type,
        content: template.content as TemplateChapter[],
        isDefault: template.isDefault
    };
}

/**
 * Get all available templates
 */
export async function getAllTemplates(): Promise<ProjectTemplate[]> {
    const templates = await prisma.template.findMany({
        where: { type: 'project' },
        orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'desc' }
        ]
    });

    return templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || undefined,
        type: t.type,
        content: t.content as TemplateChapter[],
        isDefault: t.isDefault
    }));
}

/**
 * Validate template structure
 */
export function validateTemplateStructure(content: any): boolean {
    if (!Array.isArray(content)) return false;
    
    for (const chapter of content) {
        if (!chapter.id || !chapter.title) return false;
        if (chapter.subsections && !Array.isArray(chapter.subsections)) return false;
    }
    
    return true;
}

/**
 * Get chapter structure from template
 */
export function getChapterStructure(
    template: ProjectTemplate,
    chapterNumber: number
): TemplateChapter | null {
    return template.content.find(
        ch => ch.chapterNumber === chapterNumber || ch.id === chapterNumber
    ) || null;
}
