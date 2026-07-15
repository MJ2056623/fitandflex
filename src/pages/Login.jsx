import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaDumbbell, FaUser, FaLock } from "react-icons/fa";

import api from "../api/api";

import "../styles/Login.css";

export default function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e) {

        e.preventDefault();

        try {

            const response = await api.post("/Auth/login", {
                username,
                password
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);

            navigate("/dashboard");

        }
        catch {

            setError("Invalid username or password.");

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

                    {

                        error &&

                        <div className="alert alert-danger">

                            {error}

                        </div>

                    }

                    <form onSubmit={handleLogin}>

                        <div className="input-group-custom">

                            <FaUser />

                            <input

                                type="text"

                                placeholder="Username"

                                value={username}

                                onChange={(e) => setUsername(e.target.value)}

                                required

                            />

                        </div>

                        <div className="input-group-custom">

                            <FaLock />

                            <input

                                type="password"

                                placeholder="Password"

                                value={password}

                                onChange={(e) => setPassword(e.target.value)}

                                required

                            />

                        </div>

                        <button
                            className="login-btn"
                        >
                            LOGIN
                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

}