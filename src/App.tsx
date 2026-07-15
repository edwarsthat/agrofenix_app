import { Routes, Route, Navigate } from 'react-router-dom'

import Login from "./views/login/Login";
import useSessionStore from './store/useSessionStore';
import Home from './views/home/Home';
import Usuarios from './views/administracion/usuarios/Usuarios';
import Cargos from './views/administracion/cargos/Cargos';
import CrearCargo from './views/administracion/cargos/CrearCargo';
import { FenixToastStack } from './components/UI/Toast/FenixToast';
import { useToastStore } from './store/useTosterStore';
import FenixLoading from './components/UI/Loading/FenixLoading';
import { useLoadingStore } from './store/useLoadingStore';
import { ModalHost } from './components/funcionalidad/modal/ModalHost';


function App() {
  const isAuth = useSessionStore((s) => s.isAuth);
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  const isLoading = useLoadingStore((s) => s.loading);
  const loadingLabel = useLoadingStore((s) => s.label);

  return (
    <main>
      <Routes>
        <Route path='login' element={isAuth ? <Navigate to={"/"} /> : <Login />} />
        <Route path="/"
          element={isAuth ? <Home /> : <Navigate to={"/login"} />}
        >
          <Route index element={<div>Home</div>} />
          <Route path="administracion/usuarios" element={<Usuarios />} />
          <Route path="administracion/cargos" element={<Cargos />} />
          <Route path="administracion/cargos/crear" element={<CrearCargo />} />
        </Route>
      </Routes>

      {isLoading && <FenixLoading variant="app" label={loadingLabel} />}

      <FenixToastStack toasts={toasts} onDismiss={dismiss} />
      <ModalHost />
    </main>
  );
}

export default App;
