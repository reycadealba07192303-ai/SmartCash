import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyD_g4IhPIgEfiuKtvJNbnwFI95pg80nJFE",
    authDomain: "smartcash-85233.firebaseapp.com",
    projectId: "smartcash-85233",
    storageBucket: "smartcash-85233.firebasestorage.app",
    messagingSenderId: "829579240066",
    appId: "1:829579240066:web:70e369975347ab98d14a9b",
    measurementId: "G-1MDKQLB8R0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);

export default app;
