import { useNavigate } from "react-router-dom";

import "../styles/navbar.css";

export default function Navbar() {

    const navigate = useNavigate();

    const username = localStorage.getItem("username") || "User";
    const role = localStorage.getItem("role") || "Staff";

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    function logout() {

        localStorage.clear();

        navigate("/");

    }

    return (

        <div className="navbar-custom">

            <div>

                <h5>{today}</h5>

            </div>

            <div className="navbar-right">

                <div className="avatar">

                    {role === "Admin" ? "A" : "S"}

                </div>

                <div>

                    <strong>{username}</strong>

                    <p>{role}</p>

                </div>

                <button
                    className="btn btn-danger btn-sm"
                    onClick={logout}
                >

                    Logout

                </button>

            </div>

        </div>

    );

}