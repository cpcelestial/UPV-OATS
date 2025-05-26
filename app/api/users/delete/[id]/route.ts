import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const auth = admin.auth();
const db = admin.firestore();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await auth.deleteUser(id).catch(() => {});
    await db.collection("Users").doc(id).delete();
    await db.collection("students").doc(id).delete();
    await db.collection("faculty").doc(id).delete();
    await db.collection("schedules").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}