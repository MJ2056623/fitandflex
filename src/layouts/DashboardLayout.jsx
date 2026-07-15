import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "../styles/dashboard.css";

export default function DashboardLayout({ children }) {
    return (
        <div className="dashboard-layout">

            <aside className="sidebar-container">
                <Sidebar />
            </aside>

            <main className="main-content">

                <Navbar />

                <section className="content">
                    {children}
                </section>

            </main>

        </div>
    );
}