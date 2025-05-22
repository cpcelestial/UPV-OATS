// app/api/users/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (do this only once)
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const auth = admin.auth();
const db = admin.firestore();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      studentNumber,
      facultyNumber,
      college,
      degreeProgram,
      department
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create user with Firebase Admin Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`,
      emailVerified: false,
      disabled: false
    });

    console.log('Successfully created new user:', userRecord.uid);

    // Set custom claims based on role
    await auth.setCustomUserClaims(userRecord.uid, {
      role: role,
      createdAt: Date.now()
    });

    // Prepare user data for Firestore
    const userData = {
      firstName,
      lastName,
      email,
      role,
      dateAdded: admin.firestore.FieldValue.serverTimestamp(),
      uid: userRecord.uid
    };

    // Add role-specific fields
    if (role === 'student') {
      Object.assign(userData, {
        studentNumber,
        college,
        degreeProgram
      });
    } else if (role === 'faculty') {
      Object.assign(userData, {
        facultyNumber,
        college,
        department
      });
    }

    // Create user document in main Users collection
    await db.collection('Users').doc(userRecord.uid).set(userData);

    // Create role-specific document
    if (role === 'student') {
      await db.collection('students').doc(userRecord.uid).set({
        ...userData,
        studentNumber,
        college,
        degreeProgram
      });
    } else if (role === 'faculty') {
      await db.collection('faculty').doc(userRecord.uid).set({
        ...userData,
        facultyNumber,
        college,
        department
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: role
      }
    });

  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle specific Firebase Auth errors
    let errorMessage = 'Failed to create user';
    
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Email address is already in use';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}