#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGenerationSystem() {
    console.log('🧪 Testing Project Generation System\n');

    try {
        // 1. Check Templates
        console.log('1️⃣ Checking Templates...');
        const templates = await prisma.template.findMany({
            where: { type: 'project' }
        });
        
        if (templates.length === 0) {
            console.log('   ❌ No templates found. Run: node scripts/seed-templates.mjs');
            return;
        }
        
        const defaultTemplate = templates.find(t => t.isDefault);
        if (!defaultTemplate) {
            console.log('   ⚠️  No default template set');
        } else {
            console.log(`   ✅ Default template: ${defaultTemplate.name}`);
            console.log(`   📊 Chapters in template: ${Array.isArray(defaultTemplate.content) ? defaultTemplate.content.length : 0}`);
        }

        // 2. Check API Keys
        console.log('\n2️⃣ Checking AI Provider Configuration...');
        const hasGemini = !!process.env.GEMINI_API_KEY;
        const hasGroq = !!process.env.GROQ_API_KEY;
        const hasHuggingFace = !!process.env.HUGGINGFACE_API_TOKEN;
        
        console.log(`   Gemini: ${hasGemini ? '✅' : '❌'}`);
        console.log(`   Groq: ${hasGroq ? '✅' : '❌'}`);
        console.log(`   HuggingFace: ${hasHuggingFace ? '✅' : '❌'}`);
        
        if (!hasGemini && !hasGroq && !hasHuggingFace) {
            console.log('   ❌ No AI providers configured. Add API keys to .env');
            return;
        }

        // 3. Check Database Connection
        console.log('\n3️⃣ Checking Database Connection...');
        try {
            await prisma.$connect();
            console.log('   ✅ Database connected');
        } catch (error) {
            console.log('   ❌ Database connection failed:', error.message);
            return;
        }

        // 4. Check Recent Projects
        console.log('\n4️⃣ Checking Recent Projects...');
        const recentProjects = await prisma.project.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                chapters: {
                    select: {
                        chapterNumber: true,
                        title: true,
                        status: true,
                        content: true
                    }
                }
            }
        });

        if (recentProjects.length === 0) {
            console.log('   ℹ️  No projects found');
        } else {
            console.log(`   📚 Found ${recentProjects.length} recent projects`);
            
            for (const project of recentProjects.slice(0, 3)) {
                console.log(`\n   Project: ${project.title}`);
                console.log(`   Created: ${project.createdAt.toLocaleDateString()}`);
                console.log(`   Chapters: ${project.chapters.length}`);
                
                const statusCounts = {
                    Draft: 0,
                    Generating: 0,
                    'Pending Regeneration': 0,
                    Completed: 0
                };
                
                let totalWords = 0;
                project.chapters.forEach(ch => {
                    statusCounts[ch.status] = (statusCounts[ch.status] || 0) + 1;
                    if (ch.content) {
                        totalWords += ch.content.split(/\s+/).length;
                    }
                });
                
                console.log(`   Status: Draft=${statusCounts.Draft}, Generating=${statusCounts.Generating}, Pending=${statusCounts['Pending Regeneration']}`);
                console.log(`   Total Words: ${totalWords.toLocaleString()}`);
            }
        }

        // 5. Check Generation Logs
        console.log('\n5️⃣ Checking Generation Logs...');
        const logs = await prisma.generationLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' }
        });

        if (logs.length === 0) {
            console.log('   ℹ️  No generation logs found');
        } else {
            const successCount = logs.filter(l => l.success).length;
            const failureCount = logs.filter(l => !l.success).length;
            const avgScore = logs.reduce((sum, l) => sum + l.validationScore, 0) / logs.length;
            
            console.log(`   📊 Recent Generations: ${logs.length}`);
            console.log(`   ✅ Successful: ${successCount}`);
            console.log(`   ❌ Failed: ${failureCount}`);
            console.log(`   📈 Avg Validation Score: ${avgScore.toFixed(1)}/100`);
            
            if (failureCount > 0) {
                console.log('\n   Recent Failures:');
                logs.filter(l => !l.success).slice(0, 3).forEach(log => {
                    console.log(`   - Chapter ${log.chapterNumber}: ${log.failureReason || 'Unknown'}`);
                });
            }
        }

        // 6. Validate Template Structure
        console.log('\n6️⃣ Validating Template Structure...');
        if (defaultTemplate && Array.isArray(defaultTemplate.content)) {
            const content = defaultTemplate.content;
            let valid = true;
            
            for (const chapter of content) {
                if (!chapter.id || !chapter.title) {
                    console.log(`   ❌ Invalid chapter structure: ${JSON.stringify(chapter)}`);
                    valid = false;
                }
            }
            
            if (valid) {
                console.log('   ✅ Template structure valid');
                console.log(`   📋 Chapters: ${content.map(c => c.title).join(', ')}`);
            }
        }

        // 7. System Health Summary
        console.log('\n7️⃣ System Health Summary');
        console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const health = {
            templates: templates.length > 0,
            defaultTemplate: !!defaultTemplate,
            aiProviders: hasGemini || hasGroq || hasHuggingFace,
            database: true,
            recentActivity: recentProjects.length > 0
        };
        
        const healthScore = Object.values(health).filter(Boolean).length;
        const totalChecks = Object.keys(health).length;
        
        console.log(`   Overall Health: ${healthScore}/${totalChecks} checks passed`);
        
        if (healthScore === totalChecks) {
            console.log('   ✅ System is fully operational');
        } else {
            console.log('   ⚠️  Some issues detected. Review above for details.');
        }

        console.log('\n✨ Test Complete!\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testGenerationSystem();
