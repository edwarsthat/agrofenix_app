import { Routes, Route, Navigate } from 'react-router-dom'

import Login from "./views/login/Login";
import useSessionStore from './store/useSessionStore';
import Home from './views/Home';


function App() {
  const isAuth = useSessionStore((s) => s.isAuth);

  return (
    <main>
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
