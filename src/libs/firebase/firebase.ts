import firebase from "firebase/compat/app";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


firebase.initializeApp(firebaseConfig);
export const db = firebase.database();

// // firebaseを使うための設定

// import firebase from "firebase/compat/app";
// import "firebase/compat/firestore";
// import "firebase/compat/auth";
// import "firebase/compat/storage";

// if (!firebase.apps.length) {
//   firebase.initializeApp({
//     apiKey: process.env.FIREBASE_API_KEY,
//     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.FIREBASE_APP_ID,
//   });
// }

// // console.log(process.env.FIREBASE_API_KEY);

// export default firebase;



// // import { initializeApp } from "firebase/app";
// // import { getFirestore } from "firebase/firestore";

// // const firebaseConfig = {
// //   apiKey: process.env.FIREBASE_API_KEY,
// //   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
// //   databaseURL: process.env.FIREBASE_DATABASE_URL,
// //   projectId: process.env.FIREBASE_PROJECT_ID,
// //   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
// //   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
// //   appId: process.env.FIREBASE_APP_ID,
// //   measurementId: process.env.FIREBASE_MEASUREMENT_ID
// // };

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // export const db = getFirestore(app);