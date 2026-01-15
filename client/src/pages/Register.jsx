import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Am adăugat Link
import { register } from "../api/auth";
import "./Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await register(email, password);
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="register-page">
      
      {/* --- LOGO MARE SUS --- */}
      <img src="/logo.png" alt="BugTester Logo" className="app-logo-floating" />
      {/* --------------------- */}

      <div className="register-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Register</button>
        </form>

        {error && <p className="error">{error}</p>}

        {/* Link către Login pentru UX mai bun */}
        <p className="footer-text">
            Ai deja un cont? <Link to="/login">Autentifică-te</Link>
        </p>
      </div>
    </div>
  );
}
