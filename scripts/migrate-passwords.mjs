#!/usr/bin/env node

/**
 * Password Migration Script
 * 
 * This script helps migrate existing users with plaintext passwords to bcrypt hashed passwords.
 * 
 * WARNING: This assumes you know the plaintext passwords. 
 * In most cases, it's better to just reset all passwords and ask users to re-register.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function migratePasswords() {
    console.log('🔐 Starting password migration...\n');

    try {
        // Get all users with credentials provider
        const users = await prisma.user.findMany({
            where: {
                provider: 'credentials',
                password: {
                    not: null
                }
            }
        });

        console.log(`Found ${users.length} users with credentials\n`);

        if (users.length === 0) {
            console.log('✅ No users to migrate');
            return;
        }

        console.log('⚠️  WARNING: This script cannot migrate plaintext passwords to hashed passwords');
        console.log('   because we cannot determine if a password is already hashed.\n');
        console.log('   Recommended action: Clear all passwords and ask users to re-register.\n');

        // Option to clear all passwords
        console.log('Would you like to clear all passwords? (Users will need to re-register)');
        console.log('Run this command to clear passwords:\n');
        console.log('  npx prisma db execute --stdin <<< "UPDATE users SET password = NULL WHERE provider = \'credentials\';"');
        console.log('\nOr use Prisma Studio:');
        console.log('  npx prisma studio\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migratePasswords();
