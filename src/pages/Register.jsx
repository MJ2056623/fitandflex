import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    FaUser,
    FaLock,
    FaEnvelope,
    FaUserShield
} from "react-icons/fa";

import api from "../api/api";
import "../styles/Login.css";

export default function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        role: "Staff"
    });

    const [error, setError] = useState("");

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function handleRegister(e) {

        e.preventDefault();

        try {

            await api.post("/Auth/register", form);

            alert("Registration successful!");

            navigate("/");

        } catch (err) {

            if (err.response)
                setError(err.response.data);
            else
                setError("Registration failed.");

        }
    }

    return (

        <div className="login-page">

            <div className="login-left">

                <div className="overlay">

                    <h1>FIT&FLEX</h1>

                    <h3>Create Account</h3>

                    <p>
                        Register a new Admin or Staff account.
                    </p>

                </div>

            </div>

            <div className="login-right">

                <div className="login-card">

                    <h2>Register</h2>

                    <p>Create your account</p>

                    {error &&
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    }

                    <form onSubmit={handleRegister}>

                        <div className="input-group-custom">
                            <FaUser />
                            <input
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group-custom">
                            <FaEnvelope />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group-custom">
                            <FaLock />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group-custom">
                            <FaUserShield />

                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                            >
                                <option value="Staff">Staff</option>
                                <option value="Admin">Admin</option>
                            </select>

                        </div>

                        <button className="login-btn">
                            REGISTER
                        </button>

                    </form>

                    <p className="mt-3 text-center">

                        Already have an account?

                        <Link to="/">
                            Login
                        </Link>

                    </p>

                </div>

            </div>

        </div>

    );
}