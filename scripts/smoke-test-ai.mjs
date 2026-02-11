
// Use native fetch (Node 18+)
// const fetch = global.fetch; 

const ENDPOINT = 'http://localhost:3000/api/generate-chapter';

async function testGeneration() {
    console.log('START Testing /api/generate-chapter...');

    try {
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: 'Test Topic for AI',
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
        console.log('Got JSON:', JSON.stringify(jsonData, null, 2).slice(0, 200));

        if (jsonData.result && jsonData.result.draft) {
            console.log('SUCCESS: Generated content!');
        } else {
            console.log('FAILURE: Missing draft/result');
        }

    } catch (err) {
        console.error('Fetch failed:', err);
    }
    console.log('END Test');
}

testGeneration();
