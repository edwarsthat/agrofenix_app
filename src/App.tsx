import { Routes, Route, Navigate } from 'react-router-dom'

import "./App.css";
import Login from "./views/Login";
import useSessionStore from './store/useSessionStore';
import Home from './views/Home';


function App() {
  const isAuth = useSessionStore((s) => s.isAuth);

  return (
    <main className="container">
      <Routes>
        <Route path='login' element={isAuth ? <Navigate to={"/"} /> : <Login />} />
        <Route path="/"
          element={isAuth ? <Home /> : <Navigate to={"/login"} />}
        />
      </Routes>
    </main>
  );
}

export default App;
