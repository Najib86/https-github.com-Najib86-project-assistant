#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function regenerateFailedChapters() {
    console.log('🔄 Regenerating Failed Chapters\n');

    try {
        // Find all chapters with "Pending Regeneration" status
        const failedChapters = await prisma.chapter.findMany({
            where: {
                status: 'Pending Regeneration'
            },
            include: {
                project: {
                    select: {
                        project_id: true,
                        title: true,
                        level: true
                    }
                }
            },
            orderBy: [
                { projectId: 'asc' },
                { chapterNumber: 'asc' }
            ]
        });

        if (failedChapters.length === 0) {
            console.log('✅ No failed chapters found. All chapters are in good status!');
            return;
        }

        console.log(`📊 Found ${failedChapters.length} failed chapters\n`);

        // Group by project
        const byProject = {};
        failedChapters.forEach(ch => {
            if (!byProject[ch.projectId]) {
                byProject[ch.projectId] = {
                    project: ch.project,
                    chapters: []
                };
            }
            byProject[ch.projectId].chapters.push(ch);
        });

        // Display summary
        console.log('Failed Chapters by Project:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        for (const [projectId, data] of Object.entries(byProject)) {
            console.log(`Project: ${data.project.title}`);
            console.log(`Project ID: ${projectId}`);
            console.log(`Failed Chapters: ${data.chapters.length}`);
            data.chapters.forEach(ch => {
                console.log(`  - Chapter ${ch.chapterNumber}: ${ch.title}`);
            });
            console.log('');
        }

        // Ask for confirmation
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('⚠️  This will reset all failed chapters to "Generating" status.');
        console.log('   The system will attempt to regenerate them automatically.');
        console.log('   This may take several minutes and consume API credits.\n');

        // For automated scripts, you can skip confirmation
        const shouldProceed = process.argv.includes('--force');

        if (!shouldProceed) {
            console.log('To proceed, run: node scripts/regenerate-failed-chapters.mjs --force');
            return;
        }

        console.log('🚀 Starting regeneration...\n');

        // Reset status to "Generating"
        const result = await prisma.chapter.updateMany({
            where: {
                status: 'Pending Regeneration'
            },
            data: {
                status: 'Generating',
                updatedAt: new Date()
            }
        });

        console.log(`✅ Reset ${result.count} chapters to "Generating" status`);
        console.log('\n📝 Next Steps:');
        console.log('1. The generation system will automatically process these chapters');
        console.log('2. Monitor progress in the student dashboard');
        console.log('3. Check generation logs: npm run test:generation');
        console.log('4. If issues persist, review the generation logs in the database\n');

        // Trigger regeneration by calling the generation API
        console.log('💡 Tip: To manually trigger generation, you can:');
        console.log('   - Navigate to the project page in the UI');
        console.log('   - Click "Regenerate" on individual chapters');
        console.log('   - Or wait for the background process to pick them up\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

regenerateFailedChapters();
