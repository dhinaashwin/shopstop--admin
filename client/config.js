// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
require('dotenv').config();
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTH,
  projectId:process.env.PID ,
  storageBucket:process.env.SBUCKET ,
  messagingSenderId:process.env.SID ,
  appId: process.env.APPID,
  measurementId: process.env.MID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const imageDb= getStorage(app)
const firestoreDb = getFirestore(app);

export { imageDb, firestoreDb };