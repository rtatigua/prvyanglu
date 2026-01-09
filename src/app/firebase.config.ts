import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {

    apiKey: "AIzaSyAwqjyG01sGGMsLw0HqGuafzMYLBQm2_3M",

    authDomain: "angularquests.firebaseapp.com",

    projectId: "angularquests",

    storageBucket: "angularquests.firebasestorage.app",

    messagingSenderId: "621324957234",

    appId: "1:621324957234:web:e89c749045116d06406e2b",

    measurementId: "G-GSXQDEQW6S"

};


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
