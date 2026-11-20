
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    FaDumbbell,
    FaUser,
    FaLock,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";

import api from "../api/api";
import "../styles/Login.css";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();

        if (isLoading) return;

        setError("");
        setIsLoading(true);

        try {
            const response = await api.post("/Auth/login", {
                username,
                password,
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("username", response.data.username);

            navigate("/dashboard");
        } catch {
            setError("Invalid username or password.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login-page">
            {/* LEFT SIDE */}
            <div className="login-left">
                <div className="overlay">
                    <FaDumbbell className="gym-icon" />

                    <h1>FIT&FLEX</h1>
                    <h3>Gym Membership Management System</h3>

                    <p>
                        Manage members, memberships and payments
                        from one powerful dashboard.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="login-right">
                <div className="login-card">
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue</p>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        {/* USERNAME */}
                        <div className="input-group-custom">
                            <FaUser />

                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                autoComplete="username"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className="input-group-custom password-group">
                            <FaLock />

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="current-password"
                                required
                                disabled={isLoading}
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword((prev) => !prev)
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                disabled={isLoading}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        {/* LOGIN BUTTON */}
                        <button
                            type="submit"
                            className="login-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    Logging in...
                                </>
                            ) : (
                                "LOGIN"
                            )}
                        </button>

                        <p className="mt-3 text-center">
                            Don't have an account?{" "}
                            <Link to="/register">Register Here</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
