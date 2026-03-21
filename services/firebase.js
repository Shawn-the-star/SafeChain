// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKCQf8BzBN173dtANzeHdiEjfTELzg9M8",
  authDomain: "safechain-d30b8.firebaseapp.com",
  databaseURL: "https://safechain-d30b8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "safechain-d30b8",
  storageBucket: "safechain-d30b8.firebasestorage.app",
  messagingSenderId: "203876684902",
  appId: "1:203876684902:web:d77ea7dfb687620ac7c9a7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const storage = getStorage(app);