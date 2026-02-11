import fetch from 'node-fetch';

const ENDPOINT = 'http://localhost:3000/api/create-project';
// The route path is /api/projects/create or /api/generate-chapter depending on interpretation.
// Let's verify valid endpoints.
// src/app/api/projects/create -> is for creating a new project.
// src/app/api/generate-chapter -> is for generating chapter content (POST).

const GENERATE_CHAPTER_ENDPOINT = 'http://localhost:3000/api/generate-chapter';

async function testGeneration() {
    console.log('START Testing /api/generate-chapter...');

    try {
        const res = await fetch(GENERATE_CHAPTER_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: 'Integration of AI in Rural Healthcare',
                level: 'Undergraduate',
                sampleText: ''
            })
        });

        console.log(`Response Status: ${res.status}`);

        if (!res.ok) {
            console.error(`Error: ${res.statusText}`);
            const text = await res.text();
            console.error(text.slice(0, 500));
            return;
        }

        const jsonData = await res.json();

        // Log minimal part of the response
        const snippet = JSON.stringify(jsonData, null, 2).slice(0, 200);
        console.log('Got JSON:', snippet);

        if (jsonData.result && jsonData.result.draft) {
            console.log('SUCCESS: Generated structured content!');
            console.log('Report Draft Length:', jsonData.result.draft.full_report ? jsonData.result.draft.full_report.length : 0);
        } else {
            console.log('FAILURE: Missing draft/result');
        }

    } catch (err) {
        console.error('Fetch failed:', err);
    }
    console.log('END Test');
}

testGeneration();
