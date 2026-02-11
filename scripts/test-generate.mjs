
import fetch from 'node-fetch';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:3001';

async function testProjectGeneration() {
    console.log('Testing Project Generation...');

    // 1. Create User
    const email = `testuser_${Date.now()}@test.com`;
    console.log(`Trying to create user: ${email}...`);

    let userId;

    try {
        const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Student',
                email: email,
                password: 'password123'
            })
        });

        if (!signupRes.ok) {
            const error = await signupRes.text();
            throw new Error(`Signup failed: ${signupRes.status} ${error}`);
        }

        const signupData = await signupRes.json();
        const user = signupData.user || signupData; // Handle potential structure differences
        userId = user.id;
        console.log(`User created. ID: ${userId}`);

    } catch (err) {
        console.error('Signup Error:', err);
        return;
    }

    // 2. Create Project
    console.log('Creating project...');
    const formData = new FormData();
    formData.append('studentId', String(userId));
    formData.append('title', 'AI Generated Test Project');
    formData.append('level', 'UG');
    formData.append('type', 'System-Based');
    formData.append('department', 'Computer Science');
    // No file upload for this test

    try {
        const projectRes = await fetch(`${BASE_URL}/api/projects/create`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });

        if (!projectRes.ok) {
            const error = await projectRes.text();
            throw new Error(`Project creation failed: ${projectRes.status} ${error}`);
        }

        const projectData = await projectRes.json();
        console.log('Project created successfully!');
        console.log(`Project ID: ${projectData.project_id}`);
        console.log(`Chapters should be generating now...`);

    } catch (err) {
        console.error('Project Creation Error:');
        console.error(err);
    }
}

testProjectGeneration();
