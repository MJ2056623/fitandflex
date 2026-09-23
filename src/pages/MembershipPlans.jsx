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

    const emptyPlan = {
        planName: "",
        durationMonths: "",
        price: ""
    };

    const [plans, setPlans] = useState([]);
    const [search, setSearch] = useState("");

    // CREATE PLAN FORM
    const [form, setForm] = useState(emptyPlan);

    // EDIT PLAN FORM
    const [editForm, setEditForm] = useState(emptyPlan);

    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadPlans();
    }, []);

    async function loadPlans() {

        try {

            const res = await api.get("/MembershipPlans");

            setPlans(res.data);

        } catch (err) {

            console.log(err);

        }

    }

    // =========================
    // CREATE FORM
    // =========================

    function handleChange(e) {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });

    }

    async function savePlan(e) {

        e.preventDefault();

        try {

            await api.post("/MembershipPlans", {
                planName: form.planName,
                durationMonths: Number(form.durationMonths),
                price: Number(form.price)
            });

            setForm(emptyPlan);

            await loadPlans();

        } catch (err) {

            console.log(err);

            if (err.response) {
                alert(err.response.data);
            } else {
                alert("Unable to add membership plan.");
            }

        }

    }

    // =========================
    // EDIT FORM
    // =========================

    function handleEditChange(e) {

        const { name, value } = e.target;

        setEditForm({
            ...editForm,
            [name]: value
        });

    }

    function editPlan(plan) {

        setEditingId(plan.membershipPlanID);

        setEditForm({
            planName: plan.planName || "",
            durationMonths: plan.durationMonths || "",
            price: plan.price || ""
        });

    }

    async function updatePlan(e) {

        e.preventDefault();

        try {

            await api.put(
                `/MembershipPlans/${editingId}`,
                {
                    planName: editForm.planName,
                    durationMonths: Number(editForm.durationMonths),
                    price: Number(editForm.price)
                }
            );

            cancelEdit();

            await loadPlans();

        } catch (err) {

            console.log(err);

            if (err.response) {
                alert(err.response.data);
            } else {
                alert("Unable to update membership plan.");
            }

        }

    }

    function cancelEdit() {

        setEditingId(null);
        setEditForm(emptyPlan);

    }

    // =========================
    // DELETE
    // =========================

    async function deletePlan(id) {

        if (!window.confirm("Delete this membership plan?")) {
            return;
        }

        try {

            await api.delete(`/MembershipPlans/${id}`);

            await loadPlans();

        } catch (err) {

            console.log(err);

            alert("Unable to delete membership plan.");

        }

    }

    // =========================
    // SEARCH
    // =========================

    const filteredPlans = plans.filter(plan =>

        (plan.planName || "")
            .toLowerCase()
            .includes(search.toLowerCase())

    );

    return (

        <DashboardLayout>

            {/* =========================
                PAGE HEADER
            ========================== */}

            <div className="dashboard-header">

                <div>

                    <h1>Membership Plans</h1>

                    <p>
                        Manage available gym membership plans.
                    </p>

                </div>

            </div>


            {/* =========================
                ADD PLAN FORM
            ========================== */}

            <div className="dashboard-panel mb-4">

                <form onSubmit={savePlan}>

                    <div className="row">

                        <div className="col-md-4 mb-3">

                            <input
                                className="form-control"
                                placeholder="Plan Name"
                                name="planName"
                                value={form.planName}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="col-md-4 mb-3">

                            <input
                                type="number"
                                className="form-control"
                                placeholder="Duration in Months"
                                name="durationMonths"
                                value={form.durationMonths}
                                onChange={handleChange}
                                min="1"
                                required
                            />

                        </div>


                        <div className="col-md-4 mb-3">

                            <input
                                type="number"
                                className="form-control"
                                placeholder="Price"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                            />

                        </div>


                        <div className="col-md-12">

                            <button className="btn-add">

                                <FaPlus className="me-2" />

                                Add Plan

                            </button>

                        </div>

                    </div>

                </form>

            </div>


            {/* =========================
                PLANS TABLE
            ========================== */}

            <div className="dashboard-panel">

                <div className="panel-title">

                    <span>

                        <FaClipboardList className="me-2" />

                        Membership Plans

                    </span>


                    <div style={{ width: "320px" }}>

                        <div className="input-group">

                            <span className="input-group-text">

                                <FaSearch />

                            </span>

                            <input
                                className="form-control"
                                placeholder="Search plan..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>

                    </div>

                </div>


                <table className="table align-middle">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Plan Name</th>
                            <th>Duration</th>
                            <th>Price</th>
                            <th width="180">Action</th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredPlans.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="5"
                                    className="text-center py-4"
                                >

                                    No membership plans found.

                                </td>

                            </tr>

                        ) : (

                            filteredPlans.map(plan => (

                                <tr key={plan.membershipPlanID}>

                                    <td>
                                        {plan.membershipPlanID}
                                    </td>

                                    <td>
                                        <strong>
                                            {plan.planName}
                                        </strong>
                                    </td>

                                    <td>
                                        {plan.durationMonths} month(s)
                                    </td>

                                    <td>
                                        ₱{Number(plan.price).toLocaleString()}
                                    </td>

                                    <td>

                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() =>
                                                editPlan(plan)
                                            }
                                            title="Edit Plan"
                                        >

                                            <FaEdit />

                                        </button>


                                        {role === "Admin" && (

                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    deletePlan(
                                                        plan.membershipPlanID
                                                    )
                                                }
                                                title="Delete Plan"
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


            {/* =========================
                VERTICAL EDIT PLAN FORM
            ========================== */}

            {editingId !== null && (

                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1050,
                        padding: "20px"
                    }}
                >

                    <div
                        className="dashboard-panel"
                        style={{
                            width: "100%",
                            maxWidth: "550px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            backgroundColor: "#fff"
                        }}
                    >

                        <div className="panel-title">

                            <span>

                                <FaEdit className="me-2" />

                                Edit Membership Plan

                            </span>

                        </div>


                        <form onSubmit={updatePlan}>

                            {/* PLAN NAME */}

                            <div className="mb-3">

                                <label className="form-label">
                                    Plan Name
                                </label>

                                <input
                                    className="form-control"
                                    name="planName"
                                    value={editForm.planName}
                                    onChange={handleEditChange}
                                    required
                                />

                            </div>


                            {/* DURATION */}

                            <div className="mb-3">

                                <label className="form-label">
                                    Duration in Months
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    name="durationMonths"
                                    value={editForm.durationMonths}
                                    onChange={handleEditChange}
                                    min="1"
                                    required
                                />

                            </div>


                            {/* PRICE */}

                            <div className="mb-4">

                                <label className="form-label">
                                    Price
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    name="price"
                                    value={editForm.price}
                                    onChange={handleEditChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />

                            </div>


                            {/* BUTTONS */}

                            <button className="btn-add me-2">

                                <FaEdit className="me-2" />

                                Update Plan

                            </button>


                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={cancelEdit}
                            >

                                Cancel

                            </button>

                        </form>

                    </div>

                </div>

            )}

        </DashboardLayout>

    );

}