#!/usr/bin/env node

/**
 * Auth System Test Script
 * 
 * Tests the authentication flow to ensure everything works correctly.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAuth() {
    console.log('🧪 Testing Authentication System\n');

    try {
        // Test 1: Check if bcrypt is working
        console.log('1️⃣  Testing password hashing...');
        const testPassword = 'TestPassword123';
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const isValid = await bcrypt.compare(testPassword, hashedPassword);
        
        if (isValid) {
            console.log('   ✅ Password hashing works correctly\n');
        } else {
            console.log('   ❌ Password hashing failed\n');
            return;
        }

        // Test 2: Check database connection
        console.log('2️⃣  Testing database connection...');
        await prisma.$connect();
        console.log('   ✅ Database connected\n');

        // Test 3: Check user schema
        console.log('3️⃣  Checking user schema...');
        const userCount = await prisma.user.count();
        console.log(`   ✅ Found ${userCount} users in database\n`);

        // Test 4: Check for plaintext passwords
        console.log('4️⃣  Checking for plaintext passwords...');
        const users = await prisma.user.findMany({
            where: {
                password: { not: null }
            },
            select: {
                id: true,
                email: true,
                password: true,
                provider: true
            }
        });

        let plaintextCount = 0;
        for (const user of users) {
            // Bcrypt hashes always start with $2a$, $2b$, or $2y$
            if (user.password && !user.password.startsWith('$2')) {
                plaintextCount++;
            }
        }

        if (plaintextCount > 0) {
            console.log(`   ⚠️  Found ${plaintextCount} users with plaintext passwords`);
            console.log('   💡 Run: npx prisma db execute --stdin <<< "UPDATE users SET password_hash = NULL WHERE provider = \'credentials\';"');
            console.log('   💡 Then ask users to re-register\n');
        } else {
            console.log('   ✅ All passwords are properly hashed\n');
        }

        // Test 5: Check environment variables
        console.log('5️⃣  Checking environment variables...');
        const requiredEnvVars = [
            'DATABASE_URL',
            'NEXTAUTH_SECRET',
            'NEXTAUTH_URL'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.log(`   ⚠️  Missing environment variables: ${missingVars.join(', ')}`);
            console.log('   💡 Add them to your .env file\n');
        } else {
            console.log('   ✅ All required environment variables are set\n');
        }

        // Test 6: Check optional OAuth variables
        console.log('6️⃣  Checking OAuth configuration...');
        const hasGoogleOAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
        
        if (hasGoogleOAuth) {
            console.log('   ✅ Google OAuth is configured\n');
        } else {
            console.log('   ℹ️  Google OAuth not configured (optional)\n');
        }

        // Summary
        console.log('📊 Summary:');
        console.log('   - Password hashing: ✅');
        console.log('   - Database connection: ✅');
        console.log(`   - Users in database: ${userCount}`);
        console.log(`   - Plaintext passwords: ${plaintextCount > 0 ? '⚠️  ' + plaintextCount : '✅ 0'}`);
        console.log(`   - Environment variables: ${missingVars.length > 0 ? '⚠️  Missing ' + missingVars.length : '✅'}`);
        console.log(`   - Google OAuth: ${hasGoogleOAuth ? '✅' : 'ℹ️  Not configured'}`);
        console.log('\n✅ Auth system test complete!\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run tests
testAuth();
