import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { FloorplanPage } from './pages/FloorplanPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

function App() {
  return (
    
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/account" element={<AccountPage />} />
          <Route path="/floorplan" element={<FloorplanPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/floorplan" replace />} />
    </Routes>
  );
}

export default App;
