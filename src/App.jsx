import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MembershipPlans from "./pages/MembershipPlans";
import Memberships from "./pages/Memberships";
import Payments from "./pages/Payments";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    const role = localStorage.getItem("role");

    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/members"
                    element={
                        <ProtectedRoute>
                            <Members />
                        </ProtectedRoute>
                    }
                />

                {/* Membership Plans - Admin only */}
                <Route
                    path="/plans"
                    element={
                        role === "Admin" ? (
                            <ProtectedRoute>
                                <MembershipPlans />
                            </ProtectedRoute>
                        ) : (
                            <Navigate to="/dashboard" />
                        )
                    }
                />

                <Route
                    path="/memberships"
                    element={
                        <ProtectedRoute>
                            <Memberships />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/payments"
                    element={
                        <ProtectedRoute>
                            <Payments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to="/" />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;