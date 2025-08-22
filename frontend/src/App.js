import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import enums from './constant/enum';
import useSocket from './Hooks/useSocket';
import AccountSetup from './Pages/AccountSetup/AccountSetup';
import Home from './Pages/Employee/Home';
import Dashboard from './Pages/Owner/Dashboard';
import PhoneVerification from './Pages/SignIn/PhoneVerification';
import SignIn from './Pages/SignIn/SignIn';
import ProtectedRoute from './ProtectedRoute';
import './Styles/theme.css';

function App() {
  const user = useSelector((state) => state.auth.user);

  const socket = useSocket(user?._id);
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/verify-code" element={<PhoneVerification />} />
        <Route path="/verify/:token" element={<AccountSetup />} />

        <Route
          path="/dashboard"
          element={<ProtectedRoute element={Dashboard} allowedRoles={[enums.ROLES.OWNER]} />}
        />

        <Route
          path="/home"
          element={<ProtectedRoute element={Home} allowedRoles={[enums.ROLES.EMPLOYEE]} />}
        />
      </Routes>

    </div>
  );
}

export default App;
