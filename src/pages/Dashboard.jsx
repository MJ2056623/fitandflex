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

        recentPayments: []

    });

    // ==========================================
    // GYM OPERATING HOURS
    // ==========================================

    const openingTime = "7:00 AM";
    const closingTime = "8:30 PM";

    // ==========================================
    // CURRENT TIME
    // ==========================================

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {

        loadDashboard();

        // Update current time every second
        const timer = setInterval(() => {

            setCurrentTime(new Date());

        }, 1000);

        return () => clearInterval(timer);

    }, []);

    // ==========================================
    // LOAD DASHBOARD DATA
    // ==========================================

    async function loadDashboard() {

        try {

            const res = await api.get("/Dashboard");

            setDashboard(res.data);

        }
        catch (err) {

            console.log(err);

        }

    }

    // ==========================================
    // CONVERT 12-HOUR TIME TO MINUTES
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

        return (hours * 60) + minutes;

    }

    // ==========================================
    // CHECK GYM STATUS
    // ==========================================

    function getGymStatus() {

        const day = currentTime.getDay();

        const hours = currentTime.getHours();

        const minutes = currentTime.getMinutes();

        const currentMinutes = (hours * 60) + minutes;

        const openingMinutes = timeToMinutes(openingTime);

        const closingMinutes = timeToMinutes(closingTime);

        // Sunday = CLOSED
        if (day === 0) {

            return "CLOSED";

        }

        // Monday - Saturday
        if (
            currentMinutes >= openingMinutes &&
            currentMinutes < closingMinutes
        ) {

            return "OPEN";

        }

        return "CLOSED";

    }

    const gymStatus = getGymStatus();

    // ==========================================
    // STATUS STYLE
    // ==========================================

    const gymStatusClass =
        gymStatus === "OPEN"
            ? "status-active"
            : "status-expired";

    const gymStatusText =
        gymStatus === "OPEN"
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

                    <h2>
                        {dashboard.totalMembers}
                    </h2>

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

                    <h2>
                        {dashboard.activeMemberships}
                    </h2>

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

                    <h2>
                        {dashboard.expiredMemberships}
                    </h2>

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

                    {/* STATUS */}

                    <div className="overview-row">

                        <span>Status</span>

                        <strong className={gymStatusClass}>

                            {gymStatusText}

                        </strong>

                    </div>

                    {/* BUSINESS DAYS */}

                    <div className="overview-row">

                        <span>Business Days</span>

                        <strong>
                            Monday - Saturday
                        </strong>

                    </div>

                    {/* OPERATING HOURS */}

                    <div className="overview-row">

                        <span>Operating Hours</span>

                        <strong>
                            {openingTime} - {closingTime}
                        </strong>

                    </div>

                    {/* SUNDAY */}

                    <div className="overview-row">

                        <span>Sunday</span>

                        <strong>
                            CLOSED
                        </strong>

                    </div>

                    <hr />

                    {/* TOTAL MEMBERS */}

                    <div className="overview-row">

                        <span>Total Members</span>

                        <strong>
                            {dashboard.totalMembers}
                        </strong>

                    </div>

                    {/* ACTIVE MEMBERSHIPS */}

                    <div className="overview-row">

                        <span>Active Memberships</span>

                        <strong>
                            {dashboard.activeMemberships}
                        </strong>

                    </div>

                    {/* EXPIRED MEMBERSHIPS */}

                    <div className="overview-row">

                        <span>Expired Memberships</span>

                        <strong>
                            {dashboard.expiredMemberships}
                        </strong>

                    </div>

                    {/* EXPIRING SOON */}

                    <div className="overview-row">

                        <span>Expiring Soon</span>

                        <strong>
                            {dashboard.expiringSoon}
                        </strong>

                    </div>

                    {/* TOTAL REVENUE */}

                    <div className="overview-row">

                        <span>Total Revenue</span>

                        <strong>
                            ₱{Number(dashboard.totalRevenue).toLocaleString()}
                        </strong>

                    </div>

                    {/* THIS MONTH */}

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