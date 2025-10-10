// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage"

function App() {
  return (
      <Router>
          <Routes>
            <Route path="/" element={<AuthPage/>} />
          </Routes>
      </Router>
  );
}

export default App;
