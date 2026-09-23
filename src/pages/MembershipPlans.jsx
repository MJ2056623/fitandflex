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
    price: 0
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

        const payload = {
            planName: form.planName,
            durationMonths: Number(form.durationMonths),
            price: Number(form.price)
        };

        await api.post("/MembershipPlans", payload);

        setForm(emptyPlan);

        await loadPlans();

    }
    catch (err) {

        console.log(err);

        if (err.response) {

            const message =
                typeof err.response.data === "string"
                    ? err.response.data
                    : "Unable to add membership plan.";

            alert(message);

        }
        else {

            alert("Unable to add membership plan.");

        }

    }

}

    // =========================
    // EDIT FORM
    // =========================

    function editPlan(plan) {

    setEditingId(plan.planID);

    setEditForm({
        planName: plan.planName || "",
        durationMonths: plan.durationMonths || "",
        price: plan.price || 0
    });

}

    function handleEditChange(e) {

    const { name, value } = e.target;

    const updated = {
        ...editForm,
        [name]: value
    };

    if (name === "planName") {

        if (value === "Walk-in") {
            updated.durationMonths = 0;
            updated.price = 100;
        }

    }

    if (name === "durationMonths") {

        if (
            editForm.planName === "Monthly" ||
            editForm.planName === "Yearly"
        ) {
            updated.price = Number(value) * 3000;
        }

        if (editForm.planName === "Walk-in") {
            updated.price = 100;
        }

    }

    setEditForm(updated);

}

    async function updatePlan(e) {

    e.preventDefault();

    try {

        const payload = {
            planName: editForm.planName,
            durationMonths: Number(editForm.durationMonths),
            price: Number(editForm.price)
        };

        await api.put(
            `/MembershipPlans/${editingId}`,
            payload
        );

        cancelEdit();

        await loadPlans();

    }
    catch (err) {

        console.log(err);

        if (err.response) {

            const message =
                typeof err.response.data === "string"
                    ? err.response.data
                    : "Unable to update membership plan.";

            alert(message);

        }
        else {

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
    EDIT MEMBERSHIP PLAN
========================= */}

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
            className="card shadow"
            style={{
                width: "100%",
                maxWidth: "550px",
                maxHeight: "90vh",
                overflowY: "auto",
                backgroundColor: "#fff",
                borderRadius: "15px"
            }}
        >

            <div className="card-body">

                <h4 className="mb-4">

                    <FaEdit className="me-2" />

                    Edit Membership Plan

                </h4>


                <form onSubmit={updatePlan}>

                    {/* PLAN NAME */}

                    <div className="mb-3">

                        <label className="form-label">
                            Membership Type
                        </label>

                        <select
                            className="form-select"
                            name="planName"
                            value={editForm.planName}
                            onChange={handleEditChange}
                            required
                        >

                            <option value="">
                                Select Membership Type
                            </option>

                            <option value="Monthly">
                                Monthly
                            </option>

                            <option value="Yearly">
                                Yearly
                            </option>

                            <option value="Walk-in">
                                Walk-in
                            </option>

                        </select>

                    </div>


                    {/* DURATION */}

                    <div className="mb-3">

                        <label className="form-label">
                            Duration (Months)
                        </label>

                        <input
                            type="number"
                            className="form-control"
                            name="durationMonths"
                            value={editForm.durationMonths}
                            onChange={handleEditChange}
                            min="0"
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


                    <button
                        type="submit"
                        className="btn-add me-2"
                    >

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

    </div>

)}

        </DashboardLayout>

    );

}