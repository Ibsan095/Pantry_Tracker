// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbJeHA5wxXzNlpEWlY1atpDR6sKnrJa-0",
  authDomain: "inventorymanagement-99f02.firebaseapp.com",
  projectId: "inventorymanagement-99f02",
  storageBucket: "inventorymanagement-99f02.appspot.com",
  messagingSenderId: "179065319425",
  appId: "1:179065319425:web:d25b202f9fb1a3ddee5000",
  measurementId: "G-NDBW8V7LSE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app)

export {firestore}