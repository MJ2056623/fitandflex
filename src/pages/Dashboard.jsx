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
    FaCreditCard,
    FaArrowRight
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

        }
        catch (err) {

            console.log(err);

        }

    }

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

                <div className="stat-card">

                    <div className="card-circle blue">

                        <FaUsers />

                    </div>

                    <small>Total Members</small>

                    <h2>{dashboard.totalMembers}</h2>

                </div>

                <div className="stat-card">

                    <div className="card-circle green">

                        <FaClipboardCheck />

                    </div>

                    <small>Active Memberships</small>

                    <h2>{dashboard.activeMemberships}</h2>

                </div>

                <div className="stat-card">

                    <div className="card-circle orange">

                        <FaClock />

                    </div>

                    <small>Expired Memberships</small>

                    <h2>{dashboard.expiredMemberships}</h2>

                </div>

                <div className="stat-card">

                    <div className="card-circle navy">

                        <FaMoneyBillWave />

                    </div>

                    <small>Total Payments</small>

                    <h2>{dashboard.totalPayments}</h2>

                </div>

            </div>

            {/* Bottom */}

            <div className="dashboard-bottom">

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <h3>Quick Actions</h3>

                    </div>

                    <button
                        className="action-btn"
                        onClick={() => navigate("/members")}
                    >

                        <FaUsers />

                        Members

                        <FaArrowRight />

                    </button>

                    <button
                        className="action-btn"
                        onClick={() => navigate("/plans")}
                    >

                        <FaClipboardCheck />

                        Membership Plans

                        <FaArrowRight />

                    </button>

                    <button
                        className="action-btn"
                        onClick={() => navigate("/memberships")}
                    >

                        <FaClock />

                        Memberships

                        <FaArrowRight />

                    </button>

                    <button
                        className="action-btn"
                        onClick={() => navigate("/payments")}
                    >

                        <FaCreditCard />

                        Payments

                        <FaArrowRight />

                    </button>

                </div>

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <h3>System Overview</h3>

                    </div>

                    <div className="overview-row">

                        <span>Total Membership Plans</span>

                        <strong>{dashboard.totalPlans}</strong>

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