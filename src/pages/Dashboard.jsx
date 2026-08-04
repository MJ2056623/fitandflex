import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

import {
    FaUsers,
    FaClipboardCheck,
    FaMoneyBillWave,
    FaClock,
    FaFileAlt
} from "react-icons/fa";

import "../styles/dashboard.css";

export default function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState({

        totalMembers: 0,
        activeMemberships: 0,
        expiredMemberships: 0,

        totalRevenue: 0,
        monthlyRevenue: 0,

        expiringSoon: 0,

        gymStatus: "CLOSED",

        recentPayments: []

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

    const gymStatusClass =
        dashboard.gymStatus === "OPEN"
            ? "status-active"
            : "status-expired";

    const gymStatusText =
        dashboard.gymStatus === "OPEN"
            ? "🟢 OPEN"
            : "🔴 CLOSED";

    return (

    <DashboardLayout>

        {/* Welcome Banner */}

        <div className="welcome-banner">

            <div>

                <h1>Welcome to FIT&FLEX</h1>

                <p>
                    Manage gym members, memberships, payments and reports from one dashboard.
                </p>

            </div>

        </div>

        {/* Statistics */}

        <div className="dashboard-grid">

            {/* MEMBERS */}

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

            {/* ACTIVE */}

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

            {/* EXPIRED */}

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

            {/* REVENUE */}

            <div
                className="stat-card clickable"
                onClick={() => navigate("/payments")}
            >

                <div className="card-circle navy">
                    <FaMoneyBillWave />
                </div>

                <small>Total Revenue</small>

                <h2>

                    ₱{Number(dashboard.totalRevenue).toLocaleString()}

                </h2>

            </div>

        </div>

        {/* Bottom */}

        <div className="dashboard-bottom">

            {/* REPORTS */}

            <div className="dashboard-panel">

                <div className="panel-header">

                    <h3>Reports</h3>

                </div>

                <button
                    className="action-btn"
                    onClick={() => navigate("/members")}
                >

                    <FaFileAlt />

                    Member List

                </button>

                <button
                    className="action-btn"
                    onClick={() => navigate("/memberships?status=active")}
                >

                    <FaFileAlt />

                    Active Memberships

                </button>

                <button
                    className="action-btn"
                    onClick={() => navigate("/memberships?status=expired")}
                >

                    <FaFileAlt />

                    Expired Memberships

                </button>

                <button
                    className="action-btn"
                    onClick={() => navigate("/payments")}
                >

                    <FaFileAlt />

                    Payment History

                </button>

            </div>

            {/* GYM INFORMATION */}

            <div className="dashboard-panel">

                <div className="panel-header">

                    <h3>Gym Information</h3>

                </div>

                <div className="overview-row">

                    <span>Status</span>

                    <strong className={gymStatusClass}>

                        {gymStatusText}

                    </strong>

                </div>

                <div className="overview-row">

                    <span>Business Days</span>

                    <strong>

                        Monday - Saturday

                    </strong>

                </div>

                <div className="overview-row">

                    <span>Operating Hours</span>

                    <strong>

                        7:00 AM - 8:30 PM

                    </strong>

                </div>

                <div className="overview-row">

                    <span>Sunday</span>

                    <strong>

                        CLOSED

                    </strong>

                </div>

                <hr />

                <div className="overview-row">

                    <span>Total Members</span>

                    <strong>

                        {dashboard.totalMembers}

                    </strong>

                </div>

                <div className="overview-row">

                    <span>Active Memberships</span>

                    <strong>

                        {dashboard.activeMemberships}

                    </strong>

                </div>

                <div className="overview-row">

                    <span>Expired Memberships</span>

                    <strong>

                        {dashboard.expiredMemberships}

                    </strong>

                </div>

                <div className="overview-row">

                    <span>Expiring Soon</span>

                    <strong>

                        {dashboard.expiringSoon}

                    </strong>

                </div>

                <div className="overview-row">

                    <span>Total Revenue</span>

                    <strong>

                        ₱{Number(dashboard.totalRevenue).toLocaleString()}

                    </strong>

                </div>

                <div className="overview-row">

                    <span>This Month</span>

                    <strong>

                        ₱{Number(dashboard.monthlyRevenue).toLocaleString()}

                    </strong>

                </div>

            </div>

        </div>

        {/* RECENT PAYMENTS */}

        <div className="dashboard-panel mt-4">

            <div className="panel-header">

                <h3>

                    Recent Payments

                </h3>

            </div>

            <div className="table-responsive">

                <table className="table table-striped">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Member</th>
                            <th>Amount</th>
                            <th>Date</th>

                        </tr>

                    </thead>

                    <tbody>

                        {dashboard.recentPayments.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="4"
                                    className="text-center"
                                >

                                    No recent payments.

                                </td>

                            </tr>

                        ) : (

                            dashboard.recentPayments.map(payment => (

                                <tr key={payment.paymentID}>

                                    <td>

                                        #{payment.paymentID}

                                    </td>

                                    <td>

                                        {payment.member}

                                    </td>

                                    <td>

                                        ₱{Number(payment.amount).toLocaleString()}

                                    </td>

                                    <td>

                                        {new Date(payment.paymentDate)
                                            .toLocaleDateString()}

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    </DashboardLayout>

);

}