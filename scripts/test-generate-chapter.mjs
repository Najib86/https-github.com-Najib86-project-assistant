
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testGenerateChapterAPI() {
    console.log('Testing /api/generate-chapter ...');

    try {
        const response = await fetch(`${BASE_URL}/api/generate-chapter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: 'Artificial Intelligence in Healthcare',
                level: 'Undergraduate',
                sampleText: ''
            })
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            return;
        }

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));

    } catch (err) {
        console.error('Test Error:', err);
    }
}

testGenerateChapterAPI();
