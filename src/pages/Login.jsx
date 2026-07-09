import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleLogin = async (e) => {

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

    };

    return (

        <div className="container">

            <div className="row justify-content-center mt-5">

                <div className="col-md-4">

                    <div className="card shadow">

                        <div className="card-header text-center">

                            <h3>FIT&FLEX</h3>

                            <small>Gym Membership System</small>

                        </div>

                        <div className="card-body">

                            {

                                error &&

                                <div className="alert alert-danger">

                                    {error}

                                </div>

                            }

                            <form onSubmit={handleLogin}>

                                <div className="mb-3">

                                    <label>Username</label>

                                    <input

                                        className="form-control"

                                        value={username}

                                        onChange={(e)=>setUsername(e.target.value)}

                                    />

                                </div>

                                <div className="mb-3">

                                    <label>Password</label>

                                    <input

                                        type="password"

                                        className="form-control"

                                        value={password}

                                        onChange={(e)=>setPassword(e.target.value)}

                                    />

                                </div>

                                <button

                                    className="btn btn-primary w-100">

                                    Login

                                </button>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}