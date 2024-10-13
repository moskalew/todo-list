import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDHON7T-To3iu2hOjCCEmyQZbXdjhRzURc',
  authDomain: 'todolist-1d17a.firebaseapp.com',
  projectId: 'todolist-1d17a',
  storageBucket: 'todolist-1d17a.appspot.com',
  messagingSenderId: '580193033279',
  appId: '1:580193033279:web:01aa58af20a6f8dc186c8a',
  databaseURL:
    'https://todolist-1d17a-default-rtdb.europe-west1.firebasedatabase.app/',
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
