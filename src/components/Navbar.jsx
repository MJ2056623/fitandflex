import "../styles/navbar.css";

import { FaSearch, FaBell } from "react-icons/fa";

export default function Navbar() {

    const role = localStorage.getItem("role") || "Admin";

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    return (

        <header className="navbar">

            <div className="navbar-left">

                <h2>FIT&FLEX Dashboard</h2>

                <p>{today}</p>

            </div>

            <div className="navbar-right">

                <div className="search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search..."
                    />

                </div>

                <button className="notification-btn">

                    <FaBell />

                </button>

                <div className="profile">

                    <div className="avatar">

                        {role.substring(0,1)}

                    </div>

                    <div>

                        <h4>{role}</h4>

                        <small>FIT&FLEX</small>

                    </div>

                </div>

            </div>

        </header>

    );

}