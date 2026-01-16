import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize Firebase Admin SDK
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY environment variable or service-account-key.json file
 */
export const initializeFirebase = () => {
    try {
        // Try to get service account from environment variable first
        let serviceAccount;
        
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } else {
            // Try to load from file - look in parent directory (project root)
            const keyPath = path.join(__dirname, '..', '..', 'service-account-key.json');
            
            if (!fs.existsSync(keyPath)) {
                throw new Error(
                    'Firebase service account key not found. ' +
                    'Please provide FIREBASE_SERVICE_ACCOUNT_KEY environment variable or place service-account-key.json in project root.'
                );
            }
            
            serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        }

        // Initialize Firebase Admin
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
            
            console.log('✓ Firebase Admin SDK initialized successfully');
        }

        return admin;
    } catch (error) {
        console.error('✗ Failed to initialize Firebase Admin SDK:', error.message);
        process.exit(1);
    }
};

export default initializeFirebase();
