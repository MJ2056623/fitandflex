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
        price: 0
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

        const { name, value } = e.target;

        let updated = {
            ...form,
            [name]: value
        };

        if (name === "planName") {

            if (value === "Walk-in") {

                updated.durationMonths = 0;
                updated.price = 100;

            }
            else {

                updated.durationMonths = "";
                updated.price = 0;

            }

        }

        if (name === "durationMonths") {

            if (updated.planName === "Monthly") {

                updated.price = Number(value) * 3000;

            }

            if (updated.planName === "Yearly") {

                updated.price = Number(value) * 3000;

            }

        }

        setForm(updated);

    }

    async function savePlan(e) {

        e.preventDefault();

        try {

            const payload = {
                planName: form.planName,
                durationMonths: Number(form.durationMonths),
                price: Number(form.price)
            };

            if (editingId === null) {

                await api.post("/MembershipPlans", payload);

            }
            else {

                await api.put(`/MembershipPlans/${editingId}`, payload);

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
        catch {

            alert("Unable to delete membership plan.");

        }

    }

    function resetForm() {

        setEditingId(null);

        setForm({
            planName: "",
            durationMonths: "",
            price: 0
        });

    }

    const filteredPlans = plans.filter(plan =>
        plan.planName.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <DashboardLayout>

            <div className="page-container">

                <div className="page-header">

                    <div>

                        <h1 className="page-title">

                            <FaClipboardList className="me-2"/>

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

                                <div className="col-md-4 mb-3">

                                    <label className="form-label">

                                        Duration

                                    </label>

                                    <select
                                        className="form-select"
                                        name="durationMonths"
                                        value={form.durationMonths}
                                        onChange={handleChange}
                                        disabled={form.planName === "Walk-in"}
                                        required={form.planName !== "Walk-in"}
                                    >

                                        <option value="">
                                            Select Duration
                                        </option>

                                        {form.planName === "Monthly" &&

                                            [6,7,8,9,10].map(month => (

                                                <option
                                                    key={month}
                                                    value={month}
                                                >

                                                    {month} Months

                                                </option>

                                            ))

                                        }

                                        {form.planName === "Yearly" &&

                                            Array.from({length:13},(_,i)=>i+12)
                                            .map(month => (

                                                <option
                                                    key={month}
                                                    value={month}
                                                >

                                                    {month} Months

                                                </option>

                                            ))

                                        }

                                        {form.planName === "Walk-in" &&

                                            <option value="0">

                                                Walk-in

                                            </option>

                                        }

                                    </select>

                                </div>

                                <div className="col-md-4 mb-3">

                                    <label className="form-label">

                                        Price

                                    </label>

                                    <input
                                        className="form-control"
                                        value={`₱${Number(form.price).toLocaleString()}`}
                                        readOnly
                                    />

                                </div>

                            </div>

                            <div className="d-flex gap-2">

                                <button
                                    className="btn btn-dark"
                                >

                                    <FaPlus className="me-2"/>

                                    {editingId===null
                                        ? "Add Plan"
                                        : "Update Plan"}

                                </button>

                                {editingId!==null &&

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={resetForm}
                                    >

                                        Cancel

                                    </button>

                                }

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

                                <FaSearch className="search-icon"/>

                                <input
                                    className="form-control"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e)=>setSearch(e.target.value)}
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

                                {filteredPlans.length===0 ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="text-center py-5"
                                        >

                                            No plans found.

                                        </td>

                                    </tr>

                                ) : (

                                    filteredPlans.map(plan=>(

                                        <tr key={plan.planID}>

                                            <td>

                                                #{plan.planID}

                                            </td>

                                            <td>

                                                {plan.planName}

                                            </td>

                                            <td>

                                                {plan.planName==="Walk-in"
                                                    ? "Walk-in"
                                                    : `${plan.durationMonths} Month(s)`}

                                            </td>

                                            <td>

                                                ₱{Number(plan.price).toLocaleString()}

                                            </td>

                                            <td>

                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={()=>editPlan(plan)}
                                                >

                                                    <FaEdit/>

                                                </button>

                                                {role==="Admin" &&

                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={()=>deletePlan(plan.planID)}
                                                    >

                                                        <FaTrash/>

                                                    </button>

                                                }

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