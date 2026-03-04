import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the Firebase Admin App if credentials exist
let firebaseApp: admin.app.App | null = null;

try {
    // You can either use a service account key path or rely on default credentials / env vars.
    // For easiest configuration in dev, we look for FIREBASE_SERVICE_ACCOUNT_KEY JSON string in env
    // Or FIREBASE_PROJECT_ID if we are relying on default application credentials.

    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountString) {
        const serviceAccount = JSON.parse(serviceAccountString);
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized with custom service account credentials.');
    } else if (process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID) {
        // Fallback for initializing just to communicate with the project (basic needs)
        // Usually, admin SDK requires the full service account for auth creation
        firebaseApp = admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID
        });
        console.log('Firebase Admin SDK initialized with project ID. Note: Some admin features may require a full Service Account JSON.');
    } else {
        console.warn('Firebase Admin SDK not fully initialized. Provide FIREBASE_SERVICE_ACCOUNT_KEY in .env for full Auth sync function.');
    }
} catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
}

export default admin;
