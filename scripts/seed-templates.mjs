#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_PROJECT_TEMPLATE = {
    name: "Standard Nigerian University Project Template",
    description: "Standard template following NOUN guidelines for undergraduate research projects",
    type: "project",
    isDefault: true,
    content: [
        {
            id: 1,
            chapterNumber: 1,
            title: "Title Page",
            description: "Cover page with project title, student name, and institution details",
            subsections: [
                "Project Title (Upper half)",
                "Student Full Name (Surname first)",
                "Matriculation Number",
                "Submission Statement",
                "Month and Year"
            ],
            wordCount: 100,
            guidelines: "Follow exact format specified in NOUN guidelines"
        },
        {
            id: 2,
            chapterNumber: 2,
            title: "Certification",
            description: "Supervisor certification of originality",
            subsections: [
                "Certification Statement",
                "Supervisor Name and Signature",
                "Date"
            ],
            wordCount: 150,
            guidelines: "Must include supervisor certification statement"
        },
        {
            id: 3,
            chapterNumber: 3,
            title: "Dedication",
            description: "Optional dedication to important people",
            subsections: ["Dedication Text"],
            wordCount: 100,
            guidelines: "Optional but recommended. Keep brief and meaningful."
        },
        {
            id: 4,
            chapterNumber: 4,
            title: "Acknowledgement",
            description: "Acknowledgement of contributions and support",
            subsections: ["Acknowledgement Text"],
            wordCount: 300,
            guidelines: "Acknowledge supervisor, family, friends, and institutions"
        },
        {
            id: 5,
            chapterNumber: 5,
            title: "Table of Contents",
            description: "Complete listing of chapters and sections with page numbers",
            subsections: [
                "Chapter Listings",
                "List of Tables (if applicable)",
                "List of Figures (if applicable)",
                "List of Abbreviations (if applicable)"
            ],
            wordCount: 200,
            guidelines: "Use Roman numerals for preliminary pages, Arabic for main content"
        },
        {
            id: 6,
            chapterNumber: 6,
            title: "Abstract",
            description: "Synopsis of entire work in 400 words or less",
            subsections: [
                "Problem Statement",
                "Purpose of Study",
                "Methodology",
                "Major Findings",
                "Recommendations"
            ],
            wordCount: 400,
            guidelines: "Single blocked paragraph, single line spacing, maximum 400 words"
        },
        {
            id: 7,
            chapterNumber: 7,
            title: "Chapter One: Introduction",
            description: "Introduction to the research problem and context",
            subsections: [
                "1.1 Background to the Study",
                "1.2 Statement of the Problem",
                "1.3 Research Questions",
                "1.4 Aims and Objectives",
                "1.5 Hypotheses (if applicable)",
                "1.6 Significance of the Study",
                "1.7 Scope of the Study",
                "1.8 Definition of Concepts/Operationalisation"
            ],
            wordCount: 3500,
            guidelines: "Establish context, identify problem, state objectives clearly"
        },
        {
            id: 8,
            chapterNumber: 8,
            title: "Chapter Two: Literature Review",
            description: "Comprehensive survey of existing literature",
            subsections: [
                "2.1 Conceptual Literature/Thematic Concerns",
                "2.2 Theoretical Framework of the Study",
                "2.3 Empirical Studies/Works by Different Authors"
            ],
            wordCount: 4000,
            guidelines: "Review relevant theories, concepts, and previous research"
        },
        {
            id: 9,
            chapterNumber: 9,
            title: "Chapter Three: Methodology",
            description: "Research design and methods",
            subsections: [
                "3.1 Preamble",
                "3.2 Research Design",
                "3.3 Population of the Study",
                "3.4 Sampling and Sample Size",
                "3.5 Data Collection Instrument and Validation",
                "3.6 Techniques of Data Analysis",
                "3.7 Limitations of Methodology"
            ],
            wordCount: 3000,
            guidelines: "Justify research design, explain sampling, describe instruments"
        },
        {
            id: 10,
            chapterNumber: 10,
            title: "Chapter Four: Results and Discussion",
            description: "Presentation and analysis of findings",
            subsections: [
                "4.1 Preamble",
                "4.2 Presentation and Analysis of Data",
                "4.3 Test of Hypotheses",
                "4.4 Discussion on Findings"
            ],
            wordCount: 4000,
            guidelines: "Present data with tables/charts, analyze results, test hypotheses"
        },
        {
            id: 11,
            chapterNumber: 11,
            title: "Chapter Five: Summary, Conclusion and Recommendations",
            description: "Summary of findings and recommendations",
            subsections: [
                "5.1 Summary",
                "5.2 Conclusion",
                "5.3 Recommendations"
            ],
            wordCount: 2500,
            guidelines: "Summarize findings, draw conclusions, provide actionable recommendations"
        },
        {
            id: 12,
            chapterNumber: 12,
            title: "Bibliography",
            description: "Complete list of references cited",
            subsections: [
                "References (APA/Harvard format)"
            ],
            wordCount: 500,
            guidelines: "List all sources cited in alphabetical order, proper citation format"
        }
    ]
};

async function seedTemplates() {
    try {
        console.log('🌱 Seeding default templates...');

        // Check if default template already exists
        const existingTemplate = await prisma.template.findFirst({
            where: {
                name: DEFAULT_PROJECT_TEMPLATE.name,
                type: 'project'
            }
        });

        if (existingTemplate) {
            console.log('✅ Default template already exists. Updating...');
            await prisma.template.update({
                where: { id: existingTemplate.id },
                data: {
                    description: DEFAULT_PROJECT_TEMPLATE.description,
                    content: DEFAULT_PROJECT_TEMPLATE.content,
                    isDefault: true,
                    updatedAt: new Date()
                }
            });
            console.log('✅ Template updated successfully!');
        } else {
            // Unset any existing default templates
            await prisma.template.updateMany({
                where: { type: 'project', isDefault: true },
                data: { isDefault: false }
            });

            // Create new default template
            const template = await prisma.template.create({
                data: DEFAULT_PROJECT_TEMPLATE
            });
            console.log('✅ Default template created successfully!');
            console.log(`   Template ID: ${template.id}`);
        }

        console.log('\n📊 Template Summary:');
        console.log(`   Name: ${DEFAULT_PROJECT_TEMPLATE.name}`);
        console.log(`   Chapters: ${DEFAULT_PROJECT_TEMPLATE.content.length}`);
        console.log(`   Type: ${DEFAULT_PROJECT_TEMPLATE.type}`);
        console.log(`   Default: ${DEFAULT_PROJECT_TEMPLATE.isDefault}`);

    } catch (error) {
        console.error('❌ Error seeding templates:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedTemplates();
