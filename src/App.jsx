import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login/Login";
import { auth } from "./firebase/firebaseConfig";

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);
  return (
    <div className="App">
      {user ? (
        <div>
          <h2>Welcome, {user.displayName}</h2>
          <button onClick={() => auth.signOut()}>Sign Out</button>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
