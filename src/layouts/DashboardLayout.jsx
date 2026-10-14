
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

export default function DashboardLayout({ children }) {
    return (
        <div className="dashboard-layout">
            <aside className="sidebar-container">
                <Sidebar />
            </aside>

            <main className="main-content">
                <section className="content">
                    {children}
                </section>
            </main>
        </div>
    );
}
