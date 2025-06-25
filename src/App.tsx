import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Layout from './Components/Layout';
import AdminRoutes from './routes/AdminRoutes';
import RequireAuth from './Components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <RequireAuth roles={['admin']}>
              <AdminRoutes />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;