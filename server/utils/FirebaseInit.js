import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  try {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (serviceAccountPath) {
      const { readFileSync } = await import("fs");
      const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, "utf8")
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log("Firebase initialized with service account key from .env");
    } else {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS not set in .env file");
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error.message);
    throw new Error("Firebase initialization failed: check your credentials");
  }
}

export const db = admin.firestore();
export { admin };
