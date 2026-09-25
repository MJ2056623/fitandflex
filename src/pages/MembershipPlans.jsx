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


// ==========================================
// AUTOMATIC PRICING
// ==========================================

const MONTHLY_PRICE = 3000;
const WALK_IN_PRICE = 100;


export default function MembershipPlans() {

    const role = localStorage.getItem("role");

    const [plans, setPlans] = useState([]);

    const [search, setSearch] = useState("");


    // ==========================================
    // ADD PLAN FORM
    // ==========================================

    const [form, setForm] = useState({

        planName: "",

        durationMonths: "",

        price: ""

    });


    // ==========================================
    // EDIT PLAN
    // ==========================================

    const [editingId, setEditingId] = useState(null);

    const [editForm, setEditForm] = useState({

        planName: "",

        durationMonths: "",

        price: ""

    });


    // ==========================================
    // LOAD PLANS
    // ==========================================

    useEffect(() => {

        loadPlans();

    }, []);


    async function loadPlans() {

        try {

            const res =
                await api.get("/MembershipPlans");

            setPlans(res.data);

        }
        catch (err) {

            console.log(err);

        }

    }


    // ==========================================
    // AUTOMATIC PRICE CALCULATION
    // ==========================================

    function getDefaultPrice(
        planName,
        durationMonths
    ) {

        const duration =
            Number(durationMonths);


        // WALK-IN

        if (planName === "Walk-in") {

            return WALK_IN_PRICE;

        }


        // MONTHLY / YEARLY

        if (
            planName === "Monthly" ||
            planName === "Yearly"
        ) {

            if (
                !duration ||
                duration <= 0
            ) {

                return "";

            }

            return duration * MONTHLY_PRICE;

        }


        return "";

    }


    // ==========================================
    // ADD FORM CHANGE
    // ==========================================

    function handleChange(e) {

        const {
            name,
            value
        } = e.target;


        // MEMBERSHIP TYPE

        if (name === "planName") {

            if (value === "Walk-in") {

                setForm({

                    planName: "Walk-in",

                    durationMonths: "0",

                    price: WALK_IN_PRICE

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

        if (
            name === "durationMonths"
        ) {

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
            form.price === null ||
            form.price === undefined
        ) {

            alert(
                "Please select a duration first."
            );

            return;

        }


        try {

            const payload = {

                planName:
                    form.planName,

                durationMonths:
                    form.planName === "Walk-in"
                        ? 0
                        : Number(
                            form.durationMonths
                        ),

                price:
                    Number(form.price)

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

        setForm({

            planName: "",

            durationMonths: "",

            price: ""

        });

    }


    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    function editPlan(plan) {

        setEditingId(
            plan.planID
        );


        setEditForm({

            planName:
                plan.planName,

            durationMonths:
                plan.planName === "Walk-in"
                    ? "0"
                    : String(
                        plan.durationMonths
                    ),

            // IMPORTANT:
            // Keep the existing database price.
            // Do NOT recalculate it here.
            price:
                plan.price

        });

    }


    // ==========================================
    // EDIT FORM CHANGE
    // ==========================================

    function handleEditChange(e) {

        const {
            name,
            value
        } = e.target;


        // MEMBERSHIP TYPE

        if (name === "planName") {

            if (value === "Walk-in") {

                setEditForm({

                    planName: "Walk-in",

                    durationMonths: "0",

                    price: WALK_IN_PRICE

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


        // DURATION

        if (
            name === "durationMonths"
        ) {

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


        // PRICE
        // ONLY THE EDIT FORM CAN
        // MANUALLY CHANGE PRICE

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

            alert(
                "Please select a membership type."
            );

            return;

        }


        if (
            editForm.planName !== "Walk-in" &&
            !editForm.durationMonths
        ) {

            alert(
                "Please select a duration."
            );

            return;

        }


        if (
            editForm.price === "" ||
            editForm.price === null ||
            editForm.price === undefined
        ) {

            alert(
                "Please enter a valid price."
            );

            return;

        }


        try {

            const payload = {

                planName:
                    editForm.planName,

                durationMonths:
                    editForm.planName === "Walk-in"
                        ? 0
                        : Number(
                            editForm.durationMonths
                        ),

                price:
                    Number(editForm.price)

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
        catch (err) {

            console.log(err);

            alert(
                "Unable to delete membership plan."
            );

        }

    }


    // ==========================================
    // SEARCH
    // ==========================================

    const filteredPlans =
        plans.filter(plan => {

            const planName =
                plan.planName || "";

            return planName
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                );

        });


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <DashboardLayout>

            <div className="page-container">


                {/* ==================================
                    PAGE HEADER
                ================================== */}

                <div className="page-header">

                    <div>

                        <h1 className="page-title">

                            <FaClipboardList
                                className="me-2"
                            />

                            Membership Plans

                        </h1>


                        <p className="page-subtitle">

                            Manage available gym
                            membership plans.

                        </p>

                    </div>

                </div>


                {/* ==================================
                    ADD PLAN
                ================================== */}

                <div className="card shadow-sm border-0 mb-4">

                    <div className="card-body">

                        {role === "Admin" && (

                            <form
                                onSubmit={savePlan}
                            >

                                <div className="row">


                                    {/* PLAN NAME */}

                                    <div className="col-md-4 mb-3">

                                        <label className="form-label">

                                            Plan Name

                                        </label>


                                        <select
                                            className="form-select"
                                            name="planName"
                                            value={form.planName}
                                            onChange={handleChange}
                                            required
                                        >

                                            <option value="">

                                                Select Plan

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
                                            value={
                                                form.durationMonths
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            disabled={
                                                !form.planName ||
                                                form.planName === "Walk-in"
                                            }
                                            required={
                                                form.planName !== "Walk-in"
                                            }
                                        >

                                            <option value="">

                                                Select Duration

                                            </option>


                                            {/* MONTHLY */}

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


                                            {/* YEARLY */}

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


                                            {/* WALK-IN */}

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
                                            value={
                                                form.price
                                            }
                                            readOnly
                                        />


                                        <small className="text-muted">

                                            Price is automatically
                                            calculated from the
                                            selected plan and duration.

                                        </small>

                                    </div>

                                </div>


                                <button
                                    type="submit"
                                    className="btn-add"
                                >

                                    <FaPlus
                                        className="me-2"
                                    />

                                    Add Plan

                                </button>

                            </form>

                        )}

                    </div>

                </div>


                {/* ==================================
                    MEMBERSHIP PLANS TABLE
                ================================== */}

                <div className="card shadow-sm border-0">

                    <div className="card-header bg-white">

                        <div className="d-flex justify-content-between align-items-center">

                            <h5 className="mb-0">

                                <FaClipboardList
                                    className="me-2"
                                />

                                Membership Plans

                            </h5>


                            <div className="search-box">

                                <FaSearch
                                    className="search-icon"
                                />


                                <input
                                    className="form-control"
                                    placeholder="Search plan..."
                                    value={search}
                                    onChange={
                                        e =>
                                            setSearch(
                                                e.target.value
                                            )
                                    }
                                />

                            </div>

                        </div>

                    </div>


                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Plan Name
                                    </th>

                                    <th>
                                        Duration
                                    </th>

                                    <th>
                                        Price
                                    </th>

                                    <th>
                                        Action
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

                                            No membership
                                            plans found.

                                        </td>

                                    </tr>

                                ) : (

                                    filteredPlans.map(
                                        plan => (

                                            <tr
                                                key={
                                                    plan.planID
                                                }
                                            >

                                                <td>

                                                    {plan.planID}

                                                </td>


                                                <td>

                                                    <strong>

                                                        {
                                                            plan.planName
                                                        }

                                                    </strong>

                                                </td>


                                                <td>

                                                    {
                                                        plan.planName ===
                                                        "Walk-in"
                                                            ? "0 month(s)"
                                                            : `${plan.durationMonths} month(s)`
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

                                                            {/* EDIT */}

                                                            <button
                                                                type="button"
                                                                className="btn btn-warning btn-sm me-2"
                                                                onClick={() =>
                                                                    editPlan(
                                                                        plan
                                                                    )
                                                                }
                                                                title="Edit Plan"
                                                            >

                                                                <FaEdit />

                                                            </button>


                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
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

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>


            </div>


            {/* =========================================
                EDIT PLAN MODAL
            ========================================= */}

            {editingId !== null && role === "Admin" && (

                <div className="edit-modal-overlay">

                    <div className="edit-modal">


                        {/* MODAL HEADER */}

                        <div className="edit-modal-header">

                            <h3>

                                <FaEdit
                                    className="me-2"
                                />

                                Edit Membership Plan

                            </h3>

                        </div>


                        {/* EDIT FORM */}

                        <form
                            onSubmit={updatePlan}
                        >


                            {/* PLAN NAME */}

                            <div className="edit-form-group">

                                <label className="form-label">

                                    Plan Name

                                </label>


                                <select
                                    className="form-select"
                                    name="planName"
                                    value={
                                        editForm.planName
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    required
                                >

                                    <option value="">

                                        Select Plan

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
                                    value={
                                        editForm.durationMonths
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    disabled={
                                        !editForm.planName ||
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
                                    value={
                                        editForm.price
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    min="0"
                                    step="0.01"
                                    required
                                />


                                <small className="text-muted">

                                    The automatic price can
                                    be changed by the Admin
                                    when editing.

                                </small>

                            </div>


                            {/* BUTTONS */}

                            <div className="edit-modal-buttons">

                                <button
                                    type="submit"
                                    className="btn btn-dark"
                                >

                                    <FaEdit
                                        className="me-2"
                                    />

                                    Update Plan

                                </button>


                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={
                                        cancelEdit
                                    }
                                >

                                    Cancel

                                </button>

                            </div>


                        </form>

                    </div>

                </div>

            )}

        </DashboardLayout>

    );

}