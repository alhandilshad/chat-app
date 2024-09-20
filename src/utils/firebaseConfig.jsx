import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyABjAsAQ6QGr_mv-tmugsfEasl7-BhkxZY",
  authDomain: "chat-app-c8166.firebaseapp.com",
  projectId: "chat-app-c8166",
  storageBucket: "chat-app-c8166.appspot.com",
  messagingSenderId: "826985002073",
  appId: "1:826985002073:web:4d3a3be102046ef23f6d48",
  measurementId: "G-J5RVMPBBC8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);