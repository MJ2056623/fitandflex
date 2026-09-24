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

    // ==========================================
    // ADD FORM
    // ==========================================

    const emptyForm = {
        planName: "",
        durationMonths: "",
        price: ""
    };

    const [form, setForm] = useState(emptyForm);

    // ==========================================
    // EDIT FORM
    // ==========================================

    const emptyEditForm = {
        planName: "",
        durationMonths: "",
        price: ""
    };

    const [editingId, setEditingId] = useState(null);

    const [editForm, setEditForm] = useState(emptyEditForm);

    // ==========================================
    // LOAD PLANS
    // ==========================================

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

    // ==========================================
    // DEFAULT PRICE
    // ==========================================

    function getDefaultPrice(planName, durationMonths) {

        const duration = Number(durationMonths);

        if (planName === "Walk-in") {

            return 100;

        }

        if (
            planName === "Monthly" ||
            planName === "Yearly"
        ) {

            if (!duration || duration <= 0) {

                return "";

            }

            return duration * 3000;

        }

        return "";

    }

    // ==========================================
    // ADD FORM CHANGE
    // ==========================================

    function handleChange(e) {

        const { name, value } = e.target;

        // PLAN NAME
        if (name === "planName") {

            if (value === "Walk-in") {

                setForm({

                    planName: "Walk-in",

                    durationMonths: "0",

                    price: 100

                });

                return;

            }

            setForm({

                planName: value,

                durationMonths: "",

                price: ""

            });

            return;

        }

        // DURATION
        if (name === "durationMonths") {

            const automaticPrice =
                getDefaultPrice(
                    form.planName,
                    value
                );

            setForm({

                ...form,

                durationMonths: value,

                price: automaticPrice

            });

            return;

        }

        // PRICE
        if (name === "price") {

            setForm({

                ...form,

                price: value

            });

        }

    }

    // ==========================================
    // ADD PLAN
    // ==========================================

    async function savePlan(e) {

        e.preventDefault();

        if (!form.planName) {

            alert(
                "Please select a membership type."
            );

            return;

        }

        if (
            form.planName !== "Walk-in" &&
            !form.durationMonths
        ) {

            alert(
                "Please select a duration."
            );

            return;

        }

        if (
            form.price === "" ||
            Number(form.price) < 0
        ) {

            alert(
                "Please enter a valid price."
            );

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

            await api.post(
                "/MembershipPlans",
                payload
            );

            alert(
                "Membership plan added successfully."
            );

            resetAddForm();

            loadPlans();

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

                alert(
                    "Unable to add membership plan."
                );

            }

        }

    }

    // ==========================================
    // RESET ADD FORM
    // ==========================================

    function resetAddForm() {

        setForm(emptyForm);

    }

    // ==========================================
    // OPEN EDIT FORM
    // ==========================================

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

    // ==========================================
    // EDIT FORM CHANGE
    // ==========================================

    function handleEditChange(e) {

    const { name, value } = e.target;

    if (name === "planName") {

        if (value === "Walk-in") {

            setEditForm({

                planName: "Walk-in",

                durationMonths: "0",

                price: 100

            });

            return;

        }

        setEditForm({

            planName: value,

            durationMonths: "",

            price: ""

        });

        return;

    }


    if (name === "durationMonths") {

        const automaticPrice =
            getDefaultPrice(
                editForm.planName,
                value
            );

        setEditForm({

            ...editForm,

            durationMonths: value,

            price: automaticPrice

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

    // ==========================================
    // UPDATE PLAN
    // ==========================================

    async function updatePlan(e) {

    e.preventDefault();

    if (editingId === null) {
        return;
    }

    if (!editForm.planName) {

        alert("Please select a membership type.");

        return;

    }

    if (
        editForm.planName !== "Walk-in" &&
        !editForm.durationMonths
    ) {

        alert("Please select a duration.");

        return;

    }

    if (
        editForm.price === "" ||
        Number(editForm.price) < 0
    ) {

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

        await api.put(
            `/MembershipPlans/${editingId}`,
            payload
        );

        alert(
            "Membership plan updated successfully."
        );

        cancelEdit();

        loadPlans();

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

            alert(
                "Unable to update membership plan."
            );

        }

    }

}

    // ==========================================
    // CANCEL EDIT
    // ==========================================

    function cancelEdit() {

    setEditingId(null);

    setEditForm({

        planName: "",
        durationMonths: "",
        price: ""

    });

}

    // ==========================================
    // DELETE PLAN
    // ==========================================

    async function deletePlan(id) {

        if (
            !window.confirm(
                "Delete this membership plan?"
            )
        ) {

            return;

        }

        try {

            await api.delete(
                `/MembershipPlans/${id}`
            );

            loadPlans();

        }
        catch {

            alert(
                "Unable to delete membership plan."
            );

        }

    }

    // ==========================================
    // SEARCH
    // ==========================================

    const filteredPlans = plans.filter(plan =>

        plan.planName
            ?.toLowerCase()
            .includes(
                search.toLowerCase()
            )

    );

    // ==========================================
    // RENDER
    // ==========================================

    return (

        <DashboardLayout>

            <div className="page-container">

                {/* =================================
                    PAGE HEADER
                ================================= */}

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


                {/* =================================
                    ADD PLAN FORM
                ================================= */}

                <div className="card shadow-sm border-0 mb-4">

                    <div className="card-body">

                        {role === "Admin" && (

                            <form onSubmit={savePlan}>

                                <div className="row">

                                    {/* PLAN NAME */}

                                    <div className="col-md-4 mb-3">

                                        <label className="form-label">

                                            Membership Type

                                        </label>

                                        <select
                                            className="form-select"
                                            name="planName"
                                            value={form.planName}
                                            onChange={handleChange}
                                            required
                                        >

                                            <option value="">

                                                Select Membership

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

                                    <div className="col-md-4 mb-3">

                                        <label className="form-label">

                                            Duration

                                        </label>

                                        <select
                                            className="form-select"
                                            name="durationMonths"
                                            value={form.durationMonths}
                                            onChange={handleChange}
                                            disabled={
                                                form.planName === "Walk-in"
                                            }
                                            required={
                                                form.planName !== "Walk-in"
                                            }
                                        >

                                            <option value="">

                                                Select Duration

                                            </option>

                                            {form.planName === "Monthly" && (

                                                <>
                                                    <option value="1">
                                                        1 Month
                                                    </option>

                                                    <option value="2">
                                                        2 Months
                                                    </option>

                                                    <option value="3">
                                                        3 Months
                                                    </option>

                                                    <option value="4">
                                                        4 Months
                                                    </option>

                                                    <option value="5">
                                                        5 Months
                                                    </option>

                                                    <option value="6">
                                                        6 Months
                                                    </option>

                                                    <option value="7">
                                                        7 Months
                                                    </option>

                                                    <option value="8">
                                                        8 Months
                                                    </option>

                                                    <option value="9">
                                                        9 Months
                                                    </option>

                                                    <option value="10">
                                                        10 Months
                                                    </option>

                                                    <option value="11">
                                                        11 Months
                                                    </option>

                                                    <option value="12">
                                                        12 Months
                                                    </option>
                                                </>

                                            )}

                                            {form.planName === "Yearly" && (

                                                <>
                                                    <option value="12">
                                                        12 Months
                                                    </option>

                                                    <option value="24">
                                                        24 Months
                                                    </option>

                                                    <option value="36">
                                                        36 Months
                                                    </option>

                                                    <option value="48">
                                                        48 Months
                                                    </option>

                                                    <option value="60">
                                                        60 Months
                                                    </option>
                                                </>

                                            )}

                                            {form.planName === "Walk-in" && (

                                                <option value="0">

                                                    Walk-in

                                                </option>

                                            )}

                                        </select>

                                    </div>


                                    {/* PRICE */}

                                    <div className="col-md-4 mb-3">

                                        <label className="form-label">

                                            Price (₱)

                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            value={form.price}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            required
                                        />

                                        <small className="text-muted">

                                            Automatically calculated.
                                            Admin can change the price.

                                        </small>

                                    </div>

                                </div>


                                <button
                                    type="submit"
                                    className="btn btn-dark"
                                >

                                    <FaPlus className="me-2" />

                                    Add Plan

                                </button>

                            </form>

                        )}

                    </div>

                </div>


                {/* =================================
    EDIT PLAN MODAL
================================= */}

{editingId !== null && role === "Admin" && (

    <div className="edit-modal-overlay">

        <div className="edit-modal">

            {/* MODAL HEADER */}

            <div className="edit-modal-header">

                <h3>
                    <FaEdit className="me-2" />
                    Edit Membership Plan
                </h3>

            </div>


            {/* EDIT FORM */}

            <form onSubmit={updatePlan}>

                {/* MEMBERSHIP TYPE */}

                <div className="edit-form-group">

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
                            Select Membership
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

                <div className="edit-form-group">

                    <label className="form-label">

                        Duration

                    </label>

                    <select
                        className="form-select"
                        name="durationMonths"
                        value={editForm.durationMonths}
                        onChange={handleEditChange}
                        disabled={
                            editForm.planName === "Walk-in"
                        }
                        required={
                            editForm.planName !== "Walk-in"
                        }
                    >

                        <option value="">
                            Select Duration
                        </option>


                        {/* MONTHLY */}

                        {editForm.planName === "Monthly" && (

                            <>
                                <option value="1">
                                    1 Month
                                </option>

                                <option value="2">
                                    2 Months
                                </option>

                                <option value="3">
                                    3 Months
                                </option>

                                <option value="4">
                                    4 Months
                                </option>

                                <option value="5">
                                    5 Months
                                </option>

                                <option value="6">
                                    6 Months
                                </option>

                                <option value="7">
                                    7 Months
                                </option>

                                <option value="8">
                                    8 Months
                                </option>

                                <option value="9">
                                    9 Months
                                </option>

                                <option value="10">
                                    10 Months
                                </option>

                                <option value="11">
                                    11 Months
                                </option>

                                <option value="12">
                                    12 Months
                                </option>
                            </>

                        )}


                        {/* YEARLY */}

                        {editForm.planName === "Yearly" && (

                            <>
                                <option value="12">
                                    12 Months
                                </option>

                                <option value="24">
                                    24 Months
                                </option>

                                <option value="36">
                                    36 Months
                                </option>

                                <option value="48">
                                    48 Months
                                </option>

                                <option value="60">
                                    60 Months
                                </option>
                            </>

                        )}


                        {/* WALK-IN */}

                        {editForm.planName === "Walk-in" && (

                            <option value="0">
                                Walk-in
                            </option>

                        )}

                    </select>

                </div>


                {/* PRICE */}

                <div className="edit-form-group">

                    <label className="form-label">

                        Price (₱)

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

                    <small className="text-muted">

                        Automatic price can be changed
                        by the Admin.

                    </small>

                </div>


                {/* BUTTONS */}

                <div className="edit-modal-buttons">

                    <button
                        type="submit"
                        className="btn btn-dark"
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

                </div>

            </form>

        </div>

    </div>

)}


                {/* =================================
                    MEMBERSHIP PLAN TABLE
                ================================= */}

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
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />

                            </div>

                        </div>

                    </div>


                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">

                                <tr>

                                    <th>ID</th>

                                    <th>Membership Type</th>

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

                                            No plans found.

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

                                                {plan.planName === "Walk-in"
                                                    ? "Walk-in"
                                                    : `${plan.durationMonths} Month(s)`
                                                }

                                            </td>

                                            <td>

                                                ₱
                                                {Number(
                                                    plan.price
                                                ).toLocaleString()}

                                            </td>

                                            <td>

                                                {role === "Admin" && (

                                                    <>

                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                editPlan(plan)
                                                            }
                                                            title="Edit Plan"
                                                        >

                                                            <FaEdit />

                                                        </button>

                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                deletePlan(
                                                                    plan.planID
                                                                )
                                                            }
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

            </div>

        </DashboardLayout>

    );

}