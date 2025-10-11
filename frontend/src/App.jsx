// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage"
import AdminLogin from "./pages/AdminLogin"

function App() {
  return (
      <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage/>} />
            <Route path="/admin/login" element={<AdminLogin/>} />
          </Routes>
      </Router>
  );
}

export default App;
