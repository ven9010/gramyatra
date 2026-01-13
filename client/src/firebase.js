import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAu3L7Ub2UveR7ZJ0zP49tNu5h5xNNs1NA",
  authDomain: "gramyatra-a15ba.firebaseapp.com",
  projectId: "gramyatra-a15ba",
  storageBucket: "gramyatra-a15ba.appspot.com",
  messagingSenderId: "1007319660296",
  appId: "1:1007319660296:web:21784435f2e37df3095ebd"
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

