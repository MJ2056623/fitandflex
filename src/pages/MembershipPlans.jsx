
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
import "../styles/form.css";

const MONTHLY_PRICE = 3000;
const WALK_IN_PRICE = 100;

const emptyPlan = {
    planName: "",
    durationMonths: "",
    price: ""
};

export default function MembershipPlans() {
    const role = localStorage.getItem("role");

    const [plans, setPlans] = useState([]);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({ ...emptyPlan });
    const [editForm, setEditForm] = useState({ ...emptyPlan });
    const [editingId, setEditingId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

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

    function getDefaultPrice(planName, durationMonths) {
        const duration = Number(durationMonths);

        if (planName === "Walk-in") return WALK_IN_PRICE;

        if (planName === "Monthly" || planName === "Yearly") {
            if (!duration || duration <= 0) return "";
            return duration * MONTHLY_PRICE;
        }

        return "";
    }

    function handleChange(e) {
        const { name, value } = e.target;

        if (name === "planName") {
            if (value === "Walk-in") {
                setForm({
                    planName: "Walk-in",
                    durationMonths: "0",
                    price: WALK_IN_PRICE
                });
            } else {
                setForm({
                    planName: value,
                    durationMonths: "",
                    price: ""
                });
            }
            return;
        }

        if (name === "durationMonths") {
            setForm({
                ...form,
                durationMonths: value,
                price: getDefaultPrice(form.planName, value)
            });
        }
    }

    function resetAddForm() {
        setForm({ ...emptyPlan });
    }

    function closeCreateModal() {
        setShowCreateModal(false);
        resetAddForm();
    }

    async function savePlan(e) {
        e.preventDefault();

        if (!form.planName) {
            alert("Please select a membership type.");
            return;
        }

        if (form.planName !== "Walk-in" && !form.durationMonths) {
            alert("Please select a duration.");
            return;
        }

        if (form.price === "" || form.price === null || form.price === undefined) {
            alert("Please select a duration first.");
            return;
        }

        try {
            const payload = {
                planName: form.planName,
                durationMonths:
                    form.planName === "Walk-in"
                        ? 0
                        : Number(form.durationMonths),
                price: Number(form.price)
            };

            await api.post("/MembershipPlans", payload);

            alert("Membership plan added successfully.");
            closeCreateModal();
            await loadPlans();
        } catch (err) {
            console.log(err);

            if (err.response) {
                const message =
                    typeof err.response.data === "string"
                        ? err.response.data
                        : "Unable to add membership plan.";
                alert(message);
            } else {
                alert("Unable to add membership plan.");
            }
        }
    }

    function editPlan(plan) {
        setEditingId(plan.planID);

        setEditForm({
            planName: plan.planName,
            durationMonths:
                plan.planName === "Walk-in"
                    ? "0"
                    : String(plan.durationMonths),
            price: plan.price
        });
    }

    function handleEditChange(e) {
        const { name, value } = e.target;

        if (name === "planName") {
            if (value === "Walk-in") {
                setEditForm({
                    planName: "Walk-in",
                    durationMonths: "0",
                    price: WALK_IN_PRICE
                });
            } else {
                setEditForm({
                    planName: value,
                    durationMonths: "",
                    price: ""
                });
            }
            return;
        }

        if (name === "durationMonths") {
            setEditForm({
                ...editForm,
                durationMonths: value,
                price: getDefaultPrice(editForm.planName, value)
            });
            return;
        }

        if (name === "price") {
            setEditForm({
                ...editForm,
                price: value
            });
        }
    }

    async function updatePlan(e) {
        e.preventDefault();

        if (editingId === null) return;

        if (!editForm.planName) {
            alert("Please select a membership type.");
            return;
        }

        if (editForm.planName !== "Walk-in" && !editForm.durationMonths) {
            alert("Please select a duration.");
            return;
        }

        if (editForm.price === "" || editForm.price === null || editForm.price === undefined) {
            alert("Please enter a valid price.");
            return;
        }

        try {
            const payload = {
                planName: editForm.planName,
                durationMonths:
                    editForm.planName === "Walk-in"
                        ? 0
                        : Number(editForm.durationMonths),
                price: Number(editForm.price)
            };

            await api.put(`/MembershipPlans/${editingId}`, payload);

            alert("Membership plan updated successfully.");
            cancelEdit();
            await loadPlans();
        } catch (err) {
            console.log(err);

            if (err.response) {
                const message =
                    typeof err.response.data === "string"
                        ? err.response.data
                        : "Unable to update membership plan.";
                alert(message);
            } else {
                alert("Unable to update membership plan.");
            }
        }
    }

    function cancelEdit() {
        setEditingId(null);
        setEditForm({ ...emptyPlan });
    }

    async function deletePlan(id) {
        if (!window.confirm("Delete this membership plan?")) return;

        try {
            await api.delete(`/MembershipPlans/${id}`);
            await loadPlans();
        } catch (err) {
            console.log(err);
            alert("Unable to delete membership plan.");
        }
    }

    const filteredPlans = plans.filter((plan) =>
        `${plan.planName} ${plan.durationMonths} ${plan.price}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const overlayStyle = {
        position: "fixed",
        inset: 0,
        zIndex: 1050,
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflowY: "auto"
    };

    const modalStyle = {
        width: "100%",
        maxWidth: "850px",
        maxHeight: "90vh",
        overflowY: "auto",
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "28px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.2)"
    };

    function PlanFields({ values, onChange, editing = false }) {
        return (
            <>
                <div className="mb-3">
                    <label className="form-label">Plan Name</label>
                    <select
                        className="form-select"
                        name="planName"
                        value={values.planName}
                        onChange={onChange}
                        required
                    >
                        <option value="">Select Plan</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Walk-in">Walk-in</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Duration</label>
                    <select
                        className="form-select"
                        name="durationMonths"
                        value={values.durationMonths}
                        onChange={onChange}
                        disabled={!values.planName || values.planName === "Walk-in"}
                        required={values.planName !== "Walk-in"}
                    >
                        <option value="">Select Duration</option>

                        {values.planName === "Monthly" &&
                            Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                                <option key={n} value={n}>
                                    {n} {n === 1 ? "Month" : "Months"}
                                </option>
                            ))}

                        {values.planName === "Yearly" &&
                            [12, 24, 36, 48, 60].map((n) => (
                                <option key={n} value={n}>
                                    {n} Months
                                </option>
                            ))}

                        {values.planName === "Walk-in" && (
                            <option value="0">Walk-in</option>
                        )}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="form-label">Price (₱)</label>
                    <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={values.price}
                        onChange={onChange}
                        min="0"
                        step="0.01"
                        readOnly={!editing}
                        required
                    />
                    <small className="text-muted">
                        {editing
                            ? "The Admin can change the price when editing."
                            : "Price is calculated automatically based on the selected plan and duration."}
                    </small>
                </div>
            </>
        );
    }

    return (
        <DashboardLayout>
            <div className="page-container">
                {/* PAGE HEADER */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div>
                        <h1 className="page-title">
                            <FaClipboardList className="me-2" />
                            Membership Plans
                        </h1>
                        <p className="page-subtitle">
                            Manage available gym membership plans.
                        </p>
                    </div>

                    {role === "Admin" && (
                        <button
                            type="button"
                            className="btn btn-dark"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <FaPlus className="me-2" />
                            Add Plan
                        </button>
                    )}
                </div>

                {/* ADD PLAN MODAL */}
                {showCreateModal && role === "Admin" && (
                    <div
                        style={overlayStyle}
                        onClick={closeCreateModal}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Add Membership Plan"
                            style={modalStyle}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h4 className="mb-4">
                                <FaPlus className="me-2" />
                                Add Membership Plan
                            </h4>

                            <form onSubmit={savePlan}>
                                <PlanFields
                                    values={form}
                                    onChange={handleChange}
                                />

                                <div className="d-flex justify-content-end gap-2 border-top pt-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeCreateModal}
                                    >
                                        Close
                                    </button>

                                    <button type="submit" className="btn btn-dark">
                                        <FaPlus className="me-2" />
                                        Add Plan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* PLANS TABLE */}
                <div className="dashboard-panel">
                    <div className="panel-title d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <span>
                            <FaClipboardList className="me-2" />
                            Available Membership Plans
                        </span>

                        <div style={{ width: "100%", maxWidth: "320px" }}>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaSearch />
                                </span>
                                <input
                                    className="form-control"
                                    placeholder="Search plans..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Plan Name</th>
                                    <th>Duration</th>
                                    <th>Price</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPlans.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            No membership plans found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlans.map((plan) => (
                                        <tr key={plan.planID}>
                                            <td>{plan.planID}</td>
                                            <td>{plan.planName}</td>
                                            <td>
                                                {plan.planName === "Walk-in"
                                                    ? "Walk-in"
                                                    : `${plan.durationMonths} Months`}
                                            </td>
                                            <td>
                                                ₱{Number(plan.price).toLocaleString("en-PH", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                            <td>
                                                {role === "Admin" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() => editPlan(plan)}
                                                            title="Edit Plan"
                                                        >
                                                            <FaEdit />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => deletePlan(plan.planID)}
                                                            title="Delete Plan"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* EDIT PLAN MODAL */}
                {editingId !== null && role === "Admin" && (
                    <div
                        style={overlayStyle}
                        onClick={cancelEdit}
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Edit Membership Plan"
                            style={modalStyle}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h4 className="mb-4">
                                <FaEdit className="me-2" />
                                Edit Membership Plan
                            </h4>

                            <form onSubmit={updatePlan}>
                                <PlanFields
                                    values={editForm}
                                    onChange={handleEditChange}
                                    editing
                                />

                                <div className="d-flex justify-content-end gap-2 border-top pt-3">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={cancelEdit}
                                    >
                                        Close
                                    </button>

                                    <button type="submit" className="btn btn-dark">
                                        <FaEdit className="me-2" />
                                        Update Plan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
