// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDnwuIRLlZsd_yN-5gVQWvoQFxN1CuHnpw",
    authDomain: "employeetaskmanagement-760c5.firebaseapp.com",
    projectId: "employeetaskmanagement-760c5",
    storageBucket: "employeetaskmanagement-760c5.firebasestorage.app",
    messagingSenderId: "733513990409",
    appId: "1:733513990409:web:b10d5f7f087806558013d8",
    measurementId: "G-Q296904HQJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = { db, storage };
