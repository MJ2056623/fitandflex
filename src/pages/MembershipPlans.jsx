import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

import {
    FaClipboardList,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch
} from "react-icons/fa";

export default function MembershipPlans() {

    const role = localStorage.getItem("role");

    const [plans, setPlans] = useState([]);

    const [search, setSearch] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        planName: "",
        durationMonths: "",
        price: ""
    });

    useEffect(() => {
        loadPlans();
    }, []);

    async function loadPlans() {

        try {

            const res = await api.get("/MembershipPlans");

            setPlans(res.data);

        }

        catch (err) {

            console.log(err);

        }

    }

    function handleChange(e) {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    }

    async function savePlan(e) {

        e.preventDefault();

        try {

            if (editingId === null) {

                await api.post("/MembershipPlans", {
                    planName: form.planName,
                    durationMonths: Number(form.durationMonths),
                    price: Number(form.price)
                });

            }

            else {

                await api.put(`/MembershipPlans/${editingId}`, {
                    planName: form.planName,
                    durationMonths: Number(form.durationMonths),
                    price: Number(form.price)
                });

            }

            resetForm();

            loadPlans();

        }

        catch (err) {

            console.log(err);

            alert("Unable to save membership plan.");

        }

    }

    function editPlan(plan) {

        setEditingId(plan.planID);

        setForm({
            planName: plan.planName,
            durationMonths: plan.durationMonths,
            price: plan.price
        });

    }

    async function deletePlan(id) {

        if (!window.confirm("Delete this membership plan?"))
            return;

        try {

            await api.delete(`/MembershipPlans/${id}`);

            loadPlans();

        }

        catch (err) {

            console.log(err);

            alert("Unable to delete.");

        }

    }

    function resetForm() {

        setEditingId(null);

        setForm({
            planName: "",
            durationMonths: "",
            price: ""
        });

    }

    const filteredPlans = plans.filter(plan =>

        plan.planName
            .toLowerCase()
            .includes(search.toLowerCase())

    );

    return (
        <DashboardLayout>

        <div className="page-container">

            <div className="page-header">

                <div>

                    <h1 className="page-title">

                        <FaClipboardList className="me-2" />

                        Membership Plans

                    </h1>

                    <p className="page-subtitle">
                        Manage gym membership plans.
                    </p>

                </div>

            </div>

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body">

                    <form onSubmit={savePlan}>

                        <div className="row">

                            <div className="col-md-4 mb-3">

                                <label className="form-label">

                                    Plan Name

                                </label>

                                <input
                                    className="form-control"
                                    name="planName"
                                    value={form.planName}
                                    onChange={handleChange}
                                    placeholder="Monthly Membership"
                                    required
                                />

                            </div>

                            <div className="col-md-4 mb-3">

                                <label className="form-label">

                                    Duration (Months)

                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    name="durationMonths"
                                    value={form.durationMonths}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="col-md-4 mb-3">

                                <label className="form-label">

                                    Price

                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <div className="d-flex gap-2">

                            <button
                                className="btn btn-dark"
                            >

                                <FaPlus className="me-2" />

                                {editingId === null
                                    ? "Add Plan"
                                    : "Update Plan"}

                            </button>

                            {editingId !== null && (

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={resetForm}
                                >

                                    Cancel

                                </button>

                            )}

                        </div>

                    </form>

                </div>

            </div>

            <div className="card shadow-sm border-0">

                <div className="card-header bg-white">

                    <div className="d-flex justify-content-between align-items-center">

                        <h5 className="mb-0">

                            Membership Plans

                        </h5>

                        <div className="search-box">

                            <FaSearch className="search-icon" />

                            <input
                                className="form-control"
                                placeholder="Search plan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>

                    </div>

                </div>

                <div className="table-responsive">

                    <table className="table table-hover align-middle mb-0">

                        <thead className="table-light">

                            <tr>

                                <th>ID</th>

                                <th>Plan Name</th>

                                <th>Duration</th>

                                <th>Price</th>

                                <th width="150">

                                    Actions

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredPlans.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="text-center py-5"
                                    >

                                        No membership plans found.

                                    </td>

                                </tr>

                            ) : (

                                filteredPlans.map(plan => (

                                    <tr key={plan.planID}>

                                        <td>

                                            #{plan.planID}

                                        </td>

                                        <td>

                                            {plan.planName}

                                        </td>

                                        <td>

                                            {plan.durationMonths} Month(s)

                                        </td>

                                        <td>

                                            ₱{Number(plan.price).toLocaleString()}

                                        </td>

                                        <td>

                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() => editPlan(plan)}
                                            >

                                                <FaEdit />

                                            </button>
                                                                                        {role === "Admin" && (

                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => deletePlan(plan.planID)}
                                                >

                                                    <FaTrash />

                                                </button>

                                            )}

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    </DashboardLayout>

);

}