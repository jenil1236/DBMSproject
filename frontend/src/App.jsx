// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import SubmissionPage from "./pages/SubmissionPage";

function App() {
  return (
      <Router>
          <Routes>
            <Route path="/" element={<AuthPage/>} />
            <Route path="/submission/:id" element={<SubmissionPage/>} />
          </Routes>
      </Router>
  );
}

export default App;
