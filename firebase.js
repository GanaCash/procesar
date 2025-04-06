import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA4qsn0YKtcpf1TuigTD2ywYIEe9zuD5C0",
  authDomain: "invitaciones-7d704.firebaseapp.com",
  databaseURL: "https://invitaciones-7d704-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "invitaciones-7d704",
  storageBucket: "invitaciones-7d704.firebasestorage.app",
  messagingSenderId: "125520646116",
  appId: "1:125520646116:web:899a20647fe6c8a701c1f1",
  measurementId: "G-KSXGH56RBX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, get };
