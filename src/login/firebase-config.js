// login/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithRedirect,
    getRedirectResult,
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAJATCm33plBzlAy6QkBVkXihVzh_KfwIo",
    authDomain: "profbenjanuario-4d854.firebaseapp.com",
    projectId: "profbenjanuario-4d854",
    storageBucket: "profbenjanuario-4d854.firebasestorage.app",
    messagingSenderId: "93583336957",
    appId: "1:93583336957:web:a1960f69aa3de002222594",
    measurementId: "G-7MVTDHQLMF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export { 
    app, auth, db, provider,
    signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged,
    collection, doc, getDoc, setDoc, updateDoc, addDoc, query, orderBy, limit, getDocs, serverTimestamp, deleteDoc
};
