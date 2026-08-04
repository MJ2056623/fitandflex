import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

import {
    FaUsers,
    FaClipboardCheck,
    FaMoneyBillWave,
    FaClock,
    FaUserPlus,
    FaFileAlt
} from "react-icons/fa";

import "../styles/dashboard.css";

export default function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState({
        totalMembers: 0,
        activeMemberships: 0,
        expiredMemberships: 0,
        totalPlans: 0,
        totalPayments: 0
    });

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {

        try {

            const res = await api.get("/Dashboard");

            setDashboard(res.data);

        } catch (err) {

            console.log(err);

        }

    }

    // ==========================
    // Gym Open / Closed
    // ==========================

    const now = new Date();

    const isSunday = now.getDay() === 0;

    const minutes =
        now.getHours() * 60 +
        now.getMinutes();

    const open = 7 * 60;

    const close = 20 * 60 + 30;

    const isOpen =
        !isSunday &&
        minutes >= open &&
        minutes <= close;

    return (

        <DashboardLayout>

            {/* Banner */}

            <div className="welcome-banner">

                <div>

                    <h1>Welcome to FIT&FLEX</h1>

                    <p>

                        Manage gym members, memberships and payments from one dashboard.

                    </p>

                </div>

                <button
                    className="banner-btn"
                    onClick={() => navigate("/members")}
                >

                    <FaUserPlus />

                    Add Member

                </button>

            </div>

            {/* Statistics */}

            <div className="dashboard-grid">

                <div
                    className="stat-card clickable"
                    onClick={() => navigate("/members")}
                >

                    <div className="card-circle blue">

                        <FaUsers />

                    </div>

                    <small>Total Members</small>

                    <h2>{dashboard.totalMembers}</h2>

                </div>

                <div
                    className="stat-card clickable"
                    onClick={() => navigate("/memberships?status=active")}
                >

                    <div className="card-circle green">

                        <FaClipboardCheck />

                    </div>

                    <small>Active Memberships</small>

                    <h2>{dashboard.activeMemberships}</h2>

                </div>

                <div
                    className="stat-card clickable"
                    onClick={() => navigate("/memberships?status=expired")}
                >

                    <div className="card-circle orange">

                        <FaClock />

                    </div>

                    <small>Expired Memberships</small>

                    <h2>{dashboard.expiredMemberships}</h2>

                </div>

                <div
                    className="stat-card clickable"
                    onClick={() => navigate("/payments")}
                >

                    <div className="card-circle navy">

                        <FaMoneyBillWave />

                    </div>

                    <small>Total Payments</small>

                    <h2>{dashboard.totalPayments}</h2>

                </div>

            </div>

            {/* Bottom */}

            <div className="dashboard-bottom">

                {/* Reports */}

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <h3>Reports</h3>

                    </div>

                    <button
                        className="action-btn"
                        onClick={() => navigate("/members")}
                    >

                        <FaFileAlt />

                        Member List Report

                    </button>

                    <button
                        className="action-btn"
                        onClick={() => navigate("/memberships?status=active")}
                    >

                        <FaFileAlt />

                        Active Membership Report

                    </button>

                    <button
                        className="action-btn"
                        onClick={() => navigate("/memberships?status=expired")}
                    >

                        <FaFileAlt />

                        Expired Membership Report

                    </button>

                    <button
                        className="action-btn"
                        onClick={() => navigate("/payments")}
                    >

                        <FaFileAlt />

                        Payment Report

                    </button>

                </div>

                {/* Gym Information */}

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <h3>Gym Information</h3>

                    </div>

                    <div className="overview-row">

                        <span>Business Days</span>

                        <strong>Monday - Saturday</strong>

                    </div>

                    <div className="overview-row">

                        <span>Opening Hours</span>

                        <strong>7:00 AM - 8:30 PM</strong>

                    </div>

                    <div className="overview-row">

                        <span>Sunday</span>

                        <strong>Closed</strong>

                    </div>

                    <div className="overview-row">

                        <span>Current Status</span>

                        <strong
                            style={{
                                color: isOpen ? "green" : "red"
                            }}
                        >
                            {isOpen ? "🟢 OPEN" : "🔴 CLOSED"}
                        </strong>

                    </div>

                    <div className="overview-row">

                        <span>Total Members</span>

                        <strong>{dashboard.totalMembers}</strong>

                    </div>

                    <div className="overview-row">

                        <span>Active Memberships</span>

                        <strong>{dashboard.activeMemberships}</strong>

                    </div>

                    <div className="overview-row">

                        <span>Expired Memberships</span>

                        <strong>{dashboard.expiredMemberships}</strong>

                    </div>

                    <div className="overview-row">

                        <span>Total Payments</span>

                        <strong>{dashboard.totalPayments}</strong>

                    </div>

                </div>

            </div>

        </DashboardLayout>

    );

}