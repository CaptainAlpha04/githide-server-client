import admin from 'firebase-admin';
import fs from 'fs';

// Load service account
const serviceAccountPath = './service-account-key.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
    });
}

const auth = admin.auth();

/**
 * Create a test user and get their ID token
 */
async function createTestUser() {
    try {
        // Try to create a test user
        const user = await auth.createUser({
            email: 'test@example.com',
            password: 'Test@12345',
            displayName: 'Test User'
        });

        console.log('✓ Test user created:', user.uid);
        return user.uid;
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log('ℹ Test user already exists');
            // Get existing user
            const user = await auth.getUserByEmail('test@example.com');
            return user.uid;
        }
        throw error;
    }
}

/**
 * Generate custom token for testing
 */
async function generateTestToken(uid) {
    try {
        const token = await auth.createCustomToken(uid);
        console.log('✓ Custom token generated');
        return token;
    } catch (error) {
        console.error('✗ Failed to generate token:', error.message);
        throw error;
    }
}

async function main() {
    try {
        const uid = await createTestUser();
        const token = await generateTestToken(uid);

        console.log('\n=== Test Token Generated ===');
        console.log(`UID: ${uid}`);
        console.log(`Token: ${token.substring(0, 50)}...`);
        console.log('\nUse this token for testing:');
        console.log(`Authorization: Bearer ${token}`);
        
        process.exit(0);
    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    }
}

main();
