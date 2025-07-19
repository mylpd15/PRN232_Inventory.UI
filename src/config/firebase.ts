import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "teachmatefirebase.firebaseapp.com",
  projectId: "teachmatefirebase",
  storageBucket: "teachmatefirebase.appspot.com",
  messagingSenderId: "419542229655",
  appId: "1:419542229655:web:4650f1208f890c5fb03fd2",
};

const app = firebase.initializeApp(config);

export const fbAuth = app.auth();
export const fbDb = getFirestore(app);
export const fbStorage = getStorage(app);
