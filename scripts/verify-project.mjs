
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
const PROJECT_ID = 6; // Based on previous output

async function verifyProject() {
    console.log(`Verifying Project ${PROJECT_ID}...`);

    try {
        const res = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}`);
        if (!res.ok) {
            console.error(`Error: ${res.status} ${res.statusText}`);
            console.error(await res.text());
            return;
        }

        const project = await res.json();
        console.log('Project Details:');
        console.log(`Title: ${project.title}`);
        console.log(`Chapters: ${project.chapters ? project.chapters.length : 0}`);

        if (project.chapters) {
            project.chapters.forEach(c => {
                console.log(`- Chapter ${c.chapterNumber}: ${c.title} [Status: ${c.status}] (Content Length: ${c.content?.length || 0})`);
            });
        }

    } catch (err) {
        console.error('Verification Error:', err);
    }
}

verifyProject();
