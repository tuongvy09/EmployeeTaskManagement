import { Route, Routes } from 'react-router-dom';
import './App.css';
import AccountSetup from './Pages/AccountSetup/AccountSetup';
import Home from './Pages/Employee/Home';
import Dashboard from './Pages/Owner/Dashboard';
import PhoneVerification from './Pages/SignIn/PhoneVerification';
import SignIn from './Pages/SignIn/SignIn';
import ProtectedRoute from './ProtectedRoute';
import './Styles/theme.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/verify-code" element={<PhoneVerification />} />
        <Route path="/verify/:token" element={<AccountSetup />} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute element={Dashboard} allowedRoles={["admin"]} />}
        />

        <Route
          path="/home"
          element={<ProtectedRoute element={Home} allowedRoles={["employee"]} />}
        />
      </Routes>

    </div>
  );
}

export default App;
