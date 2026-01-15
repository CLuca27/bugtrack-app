import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/projects");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      
      {/* --- AICI: LOGO ÎN AFARA CARDULUI --- */}
      <img src="/logo.png" alt="BugTester Logo" className="app-logo-floating" />
      {/* ------------------------------------ */}

      <div className="login-card">
        <h2>Login</h2>

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

          <button type="submit">Login</button>
          
          <p className="footer-text">
            Nu ai un cont? <Link to="/register">Înregistrează-te</Link>
          </p>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
