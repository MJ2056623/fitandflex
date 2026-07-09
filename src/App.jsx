import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MembershipPlans from "./pages/MembershipPlans";
import Memberships from "./pages/Memberships";
import Payments from "./pages/Payments";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Login />} />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/members" element={<Members />} />

                <Route path="/plans" element={<MembershipPlans />} />

                <Route path="/memberships" element={<Memberships />} />

                <Route path="/payments" element={<Payments />} />

            </Routes>

        </BrowserRouter>

    );

}

export default App;