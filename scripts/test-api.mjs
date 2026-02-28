
import fetch from 'node-fetch';
import fs from 'fs';

async function testProjectCreation() {
    console.log('Testing Project Creation...');
    const url = 'http://localhost:3001/api/projects'; // Assuming port 3001 from output_3001.txt
    
    // Check if 3000 is also open
    try {
        const formData = new URLSearchParams();
        formData.append('studentId', '1');
        formData.append('title', 'Test Project ' + Date.now());
        formData.append('level', 'BSc');
        formData.append('type', 'System-Based');

        const res = await fetch('http://localhost:3000/api/projects', {
            method: 'POST',
            body: formData,
        });

        console.log(`Port 3000 Status: ${res.status}`);
        const data = await res.json();
        console.log('Port 3000 Data:', data);
    } catch (err) {
        console.warn('Port 3000 failed, trying 3001...');
        try {
            const formData = new URLSearchParams();
            formData.append('studentId', '1');
            formData.append('title', 'Test Project ' + Date.now());
            formData.append('level', 'BSc');
            formData.append('type', 'System-Based');

            const res = await fetch('http://localhost:3001/api/projects', {
                method: 'POST',
                body: formData,
            });

            console.log(`Port 3001 Status: ${res.status}`);
            const data = await res.json();
            console.log('Port 3001 Data:', data);
        } catch (err2) {
            console.error('Both ports failed.');
        }
    }
}

testProjectCreation();
