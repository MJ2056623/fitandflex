
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

import {
    FaUsers,
    FaClipboardCheck,
    FaMoneyBillWave,
    FaClock,
    FaFileAlt,
    FaChartLine,
    FaUserPlus,
} from "react-icons/fa";

import "../styles/dashboard.css";

export default function Dashboard() {
    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const isAdmin = role?.toLowerCase() === "admin";

    const [dashboard, setDashboard] = useState({
        totalMembers: 0,
        activeMemberships: 0,
        expiredMemberships: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        expiringSoon: 0,
        recentPayments: [],
    });

    const [analytics, setAnalytics] = useState({
        totalMembers: 0,
        activeMemberships: 0,
        expiredMemberships: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        newMembersThisMonth: 0,
        monthlyPerformance: [],
    });

    const openingTime = "7:00 AM";
    const closingTime = "8:30 PM";

    const [currentTime, setCurrentTime] = useState(new Date());

    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    useEffect(() => {
        loadDashboard();

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    async function loadDashboard() {
        try {
            const res = await api.get("/Dashboard");

            setDashboard({
                totalMembers: res.data.totalMembers ?? 0,
                activeMemberships: res.data.activeMemberships ?? 0,
                expiredMemberships: res.data.expiredMemberships ?? 0,
                totalRevenue: res.data.totalRevenue ?? 0,
                monthlyRevenue: res.data.monthlyRevenue ?? 0,
                expiringSoon: res.data.expiringSoon ?? 0,
                recentPayments: res.data.recentPayments ?? [],
            });

        } catch (err) {
            console.error("Dashboard loading error:", err);
        }

        // Only Admin can access performance analytics
        if (isAdmin) {
            loadAnalytics();
        }
    }

    // ==========================================
    // LOAD ADMIN ANALYTICS
    // ==========================================

    async function loadAnalytics() {
        try {
            const res = await api.get("/Dashboard/analytics");

            setAnalytics({
                totalMembers: res.data.totalMembers ?? 0,
                activeMemberships: res.data.activeMemberships ?? 0,
                expiredMemberships: res.data.expiredMemberships ?? 0,
                totalRevenue: res.data.totalRevenue ?? 0,
                monthlyRevenue: res.data.monthlyRevenue ?? 0,
                newMembersThisMonth: res.data.newMembersThisMonth ?? 0,
                monthlyPerformance: res.data.monthlyPerformance ?? [],
            });

        } catch (err) {
            console.error("Analytics loading error:", err);
        }
    }

    // ==========================================
    // CURRENCY FORMAT
    // ==========================================

    function formatCurrency(amount) {
        return `₱${Number(amount || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    // ==========================================
    // GYM OPERATING HOURS
    // ==========================================

    function timeToMinutes(time) {
        const [timePart, modifier] = time.split(" ");

        let [hours, minutes] = timePart.split(":").map(Number);

        if (modifier === "PM" && hours !== 12) {
            hours += 12;
        }

        if (modifier === "AM" && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    }

    function getGymStatus() {
        const day = currentTime.getDay();

        const currentMinutes =
            currentTime.getHours() * 60 + currentTime.getMinutes();

        const openingMinutes = timeToMinutes(openingTime);
        const closingMinutes = timeToMinutes(closingTime);

        if (day === 0) {
            return "CLOSED";
        }

        if (
            currentMinutes >= openingMinutes &&
            currentMinutes < closingMinutes
        ) {
            return "OPEN";
        }

        return "CLOSED";
    }

    const gymStatus = getGymStatus();

    const gymStatusClass =
        gymStatus === "OPEN"
            ? "status-active"
            : "status-expired";

    const gymStatusText =
        gymStatus === "OPEN"
            ? "🟢 OPEN"
            : "🔴 CLOSED";

    // ==========================================
    // CHART DATA
    // ==========================================

    const monthlyData = analytics.monthlyPerformance || [];

    const maxRevenue = Math.max(
        ...monthlyData.map((item) => Number(item.revenue || 0)),
        1
    );

    const maxNewMembers = Math.max(
        ...monthlyData.map((item) => Number(item.newMembers || 0)),
        1
    );

    // ==========================================
    // CHART STYLES
    // ==========================================

    const chartContainerStyle = {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-around",
        gap: "12px",
        height: "190px",
        padding: "15px 5px 0",
        borderBottom: "1px solid #dee2e6",
    };

    const barItemStyle = {
        flex: 1,
        minWidth: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "8px",
    };

    return (
        <DashboardLayout>

            {/* ================================== */}
            {/* WELCOME BANNER */}
            {/* ================================== */}

            <div className="welcome-banner">
                <div>
                    <h1>Welcome to FIT&FLEX</h1>

                    <p>
                        Manage gym members, memberships, payments and reports
                        from one dashboard.
                    </p>
                </div>
            </div>

            {/* ================================== */}
            {/* DASHBOARD STATISTICS */}
            {/* ================================== */}

            <div className="dashboard-grid">

                {/* TOTAL MEMBERS */}

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

                {/* ACTIVE MEMBERSHIPS */}

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

                {/* EXPIRED MEMBERSHIPS */}

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

                {/* TOTAL REVENUE */}

                <div
                    className="stat-card clickable"
                    onClick={() => navigate("/payments")}
                >
                    <div className="card-circle navy">
                        <FaMoneyBillWave />
                    </div>

                    <small>Total Revenue</small>

                    <h2>{formatCurrency(dashboard.totalRevenue)}</h2>
                </div>

            </div>

            {/* ================================== */}
            {/* ADMIN GYM PERFORMANCE ANALYTICS */}
            {/* ================================== */}

            {isAdmin && (
                <div style={{ marginTop: "25px" }}>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "12px",
                            marginBottom: "18px",
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    color: "#0b1f48",
                                    fontWeight: 700,
                                    marginBottom: "5px",
                                }}
                            >
                                <FaChartLine className="me-2" />
                                Gym Performance Analytics
                            </h2>

                            <p className="text-muted mb-0">
                                Monitor revenue and membership performance.
                            </p>
                        </div>
                    </div>

                    {/* PERFORMANCE CARDS */}

                    <div className="dashboard-grid">

                        <div className="stat-card">
                            <div className="card-circle green">
                                <FaMoneyBillWave />
                            </div>

                            <small>Monthly Revenue</small>

                            <h2>
                                {formatCurrency(analytics.monthlyRevenue)}
                            </h2>
                        </div>

                        <div className="stat-card">
                            <div className="card-circle blue">
                                <FaUserPlus />
                            </div>

                            <small>New Members This Month</small>

                            <h2>{analytics.newMembersThisMonth}</h2>
                        </div>

                    </div>

                    {/* PERFORMANCE CHARTS */}

                    <div
                        className="dashboard-bottom"
                        style={{ marginTop: "20px" }}
                    >

                        {/* REVENUE CHART */}

                        <div className="dashboard-panel">

                            <div className="panel-header">
                                <h3>Monthly Revenue</h3>
                            </div>

                            <p className="text-muted">
                                Revenue for the last six months
                            </p>

                            {monthlyData.length === 0 ? (
                                <p className="text-center text-muted py-5">
                                    No revenue data available.
                                </p>
                            ) : (
                                <div style={chartContainerStyle}>
                                    {monthlyData.map((item, index) => {
                                        const revenue = Number(
                                            item.revenue || 0
                                        );

                                        const height =
                                            (revenue / maxRevenue) * 130;

                                        return (
                                            <div
                                                key={`${item.month}-${index}`}
                                                style={barItemStyle}
                                            >
                                                <small
                                                    style={{
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                        textAlign: "center",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {revenue > 0
                                                        ? formatCurrency(revenue)
                                                        : "₱0"}
                                                </small>

                                                <div
                                                    title={`${item.month}: ${formatCurrency(revenue)}`}
                                                    style={{
                                                        width: "65%",
                                                        maxWidth: "55px",
                                                        height: `${Math.max(
                                                            height,
                                                            4
                                                        )}px`,
                                                        background: "#2563eb",
                                                        borderRadius:
                                                            "7px 7px 0 0",
                                                        transition:
                                                            "height 0.3s ease",
                                                    }}
                                                />

                                                <small
                                                    style={{
                                                        fontSize: "11px",
                                                        color: "#666",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {item.month}
                                                </small>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>

                        {/* NEW MEMBERS CHART */}

                        <div className="dashboard-panel">

                            <div className="panel-header">
                                <h3>New Member Registrations</h3>
                            </div>

                            <p className="text-muted">
                                New members registered in the last six months
                            </p>

                            {monthlyData.length === 0 ? (
                                <p className="text-center text-muted py-5">
                                    No registration data available.
                                </p>
                            ) : (
                                <div style={chartContainerStyle}>
                                    {monthlyData.map((item, index) => {
                                        const count = Number(
                                            item.newMembers || 0
                                        );

                                        const height =
                                            (count / maxNewMembers) * 130;

                                        return (
                                            <div
                                                key={`${item.month}-${index}`}
                                                style={barItemStyle}
                                            >
                                                <small
                                                    style={{
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {count}
                                                </small>

                                                <div
                                                    title={`${item.month}: ${count} new members`}
                                                    style={{
                                                        width: "65%",
                                                        maxWidth: "55px",
                                                        height: `${Math.max(
                                                            height,
                                                            4
                                                        )}px`,
                                                        background: "#16a34a",
                                                        borderRadius:
                                                            "7px 7px 0 0",
                                                        transition:
                                                            "height 0.3s ease",
                                                    }}
                                                />

                                                <small
                                                    style={{
                                                        fontSize: "11px",
                                                        color: "#666",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {item.month}
                                                </small>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            )}

            {/* ================================== */}
            {/* REPORTS AND GYM INFORMATION */}
            {/* ================================== */}

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
                        <strong>Monday - Saturday</strong>
                    </div>

                    <div className="overview-row">
                        <span>Operating Hours</span>
                        <strong>
                            {openingTime} - {closingTime}
                        </strong>
                    </div>

                    <div className="overview-row">
                        <span>Sunday</span>
                        <strong>CLOSED</strong>
                    </div>

                    <hr />

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
                        <span>Expiring Soon</span>
                        <strong>{dashboard.expiringSoon}</strong>
                    </div>

                    <div className="overview-row">
                        <span>Total Revenue</span>
                        <strong>
                            {formatCurrency(dashboard.totalRevenue)}
                        </strong>
                    </div>

                    <div className="overview-row">
                        <span>This Month</span>
                        <strong>
                            {formatCurrency(dashboard.monthlyRevenue)}
                        </strong>
                    </div>

                </div>

            </div>

            {/* ================================== */}
            {/* RECENT PAYMENTS */}
            {/* ================================== */}

            <div className="dashboard-panel mt-4">

                <div className="panel-header">
                    <h3>Recent Payments</h3>
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
                                    <td colSpan="4" className="text-center">
                                        No recent payments.
                                    </td>
                                </tr>
                            ) : (
                                dashboard.recentPayments.map((payment) => (
                                    <tr key={payment.paymentID}>
                                        <td>#{payment.paymentID}</td>

                                        <td>{payment.member}</td>

                                        <td>
                                            {formatCurrency(payment.amount)}
                                        </td>

                                        <td>
                                            {new Date(
                                                payment.paymentDate
                                            ).toLocaleDateString()}
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
