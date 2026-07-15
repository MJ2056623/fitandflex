import {
    FaHome,
    FaUsers,
    FaClipboardList,
    FaCreditCard,
    FaCalendarAlt,
    FaSignOutAlt
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";

import "../styles/sidebar.css";

import logo from "../assets/logo.png"; // Put your FIT&FLEX logo here

export default function Sidebar() {

    const navigate = useNavigate();

    const logout = () => {

        localStorage.clear();

        navigate("/");

    };

    return (

        <aside className="sidebar">

            <div className="sidebar-top">

                <div className="brand">

                    <img
                        src={logo}
                        alt="FIT&FLEX"
                        className="brand-logo"
                    />

                    <div>

                        <h2>FIT&FLEX</h2>

                        <p>SYSTEM MANAGEMENT</p>

                    </div>

                </div>

            </div>

            <nav className="menu">

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "menu-item active-menu" : "menu-item"
                    }
                >
                    <FaHome />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/members"
                    className={({ isActive }) =>
                        isActive ? "menu-item active-menu" : "menu-item"
                    }
                >
                    <FaUsers />
                    <span>Members</span>
                </NavLink>

                <NavLink
                    to="/plans"
                    className={({ isActive }) =>
                        isActive ? "menu-item active-menu" : "menu-item"
                    }
                >
                    <FaClipboardList />
                    <span>Membership Plans</span>
                </NavLink>

                <NavLink
                    to="/memberships"
                    className={({ isActive }) =>
                        isActive ? "menu-item active-menu" : "menu-item"
                    }
                >
                    <FaCalendarAlt />
                    <span>Memberships</span>
                </NavLink>

                <NavLink
                    to="/payments"
                    className={({ isActive }) =>
                        isActive ? "menu-item active-menu" : "menu-item"
                    }
                >
                    <FaCreditCard />
                    <span>Payments</span>
                </NavLink>

            </nav>

            <button
                className="logout"
                onClick={logout}
            >
                <FaSignOutAlt />
                <span>Logout</span>
            </button>

        </aside>

    );

}