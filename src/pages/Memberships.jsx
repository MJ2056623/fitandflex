import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

import {
    FaEdit,
    FaTrash,
    FaRedoAlt
} from "react-icons/fa";

export default function Memberships() {

    const role = localStorage.getItem("role");

    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get("status");

    const emptyMembership = {
        memberID: "",
        planID: "",
        startDate: "",
        endDate: "",
        status: "Active"
    };

    const [memberships, setMemberships] = useState([]);
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);

    // CREATE FORM
    const [form, setForm] = useState({
        memberID: "",
        planID: ""
    });

    // EDIT FORM
    const [editForm, setEditForm] = useState(emptyMembership);

    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {

        try {

            const [
                membershipRes,
                memberRes,
                planRes
            ] = await Promise.all([

                api.get("/Memberships"),
                api.get("/Members"),
                api.get("/MembershipPlans")

            ]);

            setMemberships(membershipRes.data);
            setMembers(memberRes.data);
            setPlans(planRes.data);

        }
        catch (err) {

            console.log(err);

        }

    }

    // CREATE FORM
    function handleChange(e) {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    }

    // EDIT FORM
    function handleEditChange(e) {

        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });

    }

    const filteredMemberships = memberships.filter(m => {

        if (!statusFilter)
            return true;

        return (
            m.status &&
            m.status.toLowerCase() ===
            statusFilter.toLowerCase()
        );

    });

    // CREATE MEMBERSHIP
    async function saveMembership(e) {

        e.preventDefault();

        try {

            const payload = {
                memberID: Number(form.memberID),
                planID: Number(form.planID)
            };

            await api.post(
                "/Memberships",
                payload
            );

            setForm({
                memberID: "",
                planID: ""
            });

            await loadData();

        }
        catch (err) {

            console.log(err);

            if (err.response)
                alert(JSON.stringify(err.response.data));
            else
                alert(err.message);

        }

    }

    // OPEN EDIT FORM
    function editMembership(item) {

        setEditingId(item.membershipID);

        setEditForm({
            memberID: item.memberID || "",
            planID: item.planID || "",
            startDate: item.startDate
                ? item.startDate.substring(0, 10)
                : "",
            endDate: item.endDate
                ? item.endDate.substring(0, 10)
                : "",
            status: item.status || "Active"
        });

    }

    // UPDATE MEMBERSHIP
    async function updateMembership(e) {

        e.preventDefault();

        try {

            const payload = {
                memberID: Number(editForm.memberID),
                planID: Number(editForm.planID),
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                status: editForm.status
            };

            await api.put(
                `/Memberships/${editingId}`,
                payload
            );

            cancelEdit();

            await loadData();

        }
        catch (err) {

            console.log(err);

            if (err.response)
                alert(JSON.stringify(err.response.data));
            else
                alert(err.message);

        }

    }

    function cancelEdit() {

        setEditingId(null);
        setEditForm(emptyMembership);

    }

    async function deleteMembership(id) {

        if (!window.confirm("Delete this membership?"))
            return;

        try {

            await api.delete(
                `/Memberships/${id}`
            );

            await loadData();

        }
        catch (err) {

            console.log(err);

            alert("Unable to delete membership.");

        }

    }

    async function renewMembership(id) {

        if (
            !window.confirm(
                "Renew this membership?\n\nThe membership period will restart from today."
            )
        )
            return;

        try {

            await api.put(
                `/Memberships/renew/${id}`
            );

            alert(
                "Membership renewed successfully."
            );

            await loadData();

        }
        catch (err) {

            console.log(err);

            if (err.response)
                alert(JSON.stringify(err.response.data));
            else
                alert(err.message);

        }

    }

    return (

        <DashboardLayout>

            <div className="page-header">

                <div>

                    <h1>
                        Memberships
                    </h1>

                    <p>
                        Manage member subscriptions and renewals.
                    </p>

                </div>

            </div>


            {/* =========================
                CREATE MEMBERSHIP FORM
            ========================== */}

            <div className="page-card">

                <div className="card-header-custom">

                    <h4>
                        Create Membership
                    </h4>

                </div>


                <form onSubmit={saveMembership}>

                    <div className="row">

                        <div className="col-md-6 mb-3">

                            <label className="form-label">

                                Member

                            </label>

                            <select
                                className="form-select"
                                name="memberID"
                                value={form.memberID}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Member
                                </option>

                                {members.map(member => (

                                    <option
                                        key={member.memberID}
                                        value={member.memberID}
                                    >

                                        {member.firstName}{" "}
                                        {member.lastName}

                                    </option>

                                ))}

                            </select>

                        </div>


                        <div className="col-md-6 mb-3">

                            <label className="form-label">

                                Membership Plan

                            </label>

                            <select
                                className="form-select"
                                name="planID"
                                value={form.planID}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Plan
                                </option>

                                {plans.map(plan => (

                                    <option
                                        key={plan.planID}
                                        value={plan.planID}
                                    >

                                        {plan.planName}

                                    </option>

                                ))}

                            </select>

                        </div>

                    </div>


                    <button className="btn-add">

                        Create Membership

                    </button>

                </form>

            </div>


            {/* =========================
                MEMBERSHIP LIST
            ========================== */}

            <div className="page-card mt-4">

                <div className="card-header-custom">

                    <h4>
                        Membership List
                    </h4>

                </div>


                <div className="table-responsive">

                    <table className="table custom-table">

                        <thead>

                            <tr>

                                <th>ID</th>
                                <th>Member</th>
                                <th>Plan</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Remaining</th>
                                <th>Status</th>
                                <th width="220">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredMemberships.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="text-center"
                                    >

                                        {statusFilter
                                            ? `No ${statusFilter} memberships found.`
                                            : "No memberships found."
                                        }

                                    </td>

                                </tr>

                            ) : (

                                filteredMemberships.map(item => (

                                    <tr
                                        key={item.membershipID}
                                        className={
                                            item.status === "Expired"
                                                ? "table-danger"
                                                : ""
                                        }
                                    >

                                        <td>
                                            #{item.membershipID}
                                        </td>


                                        <td>

                                            {item.member
                                                ? `${item.member.firstName} ${item.member.lastName}`
                                                : item.memberID
                                            }

                                        </td>


                                        <td>

                                            <strong>

                                                {item.membershipPlan
                                                    ? item.membershipPlan.planName
                                                    : "N/A"
                                                }

                                            </strong>


                                            {item.membershipPlan &&
                                                item.membershipPlan.planName !== "Walk-in" && (

                                                    <div className="text-muted small">

                                                        {Math.max(
                                                            0,
                                                            Math.ceil(
                                                                (
                                                                    new Date(item.endDate) -
                                                                    new Date()
                                                                ) /
                                                                (1000 * 60 * 60 * 24)
                                                            )
                                                        )}{" "}
                                                        days left

                                                    </div>

                                                )}

                                        </td>


                                        <td>

                                            {item.startDate
                                                ? new Date(
                                                    item.startDate
                                                ).toLocaleDateString()
                                                : "N/A"
                                            }

                                        </td>


                                        <td>

                                            {item.endDate
                                                ? new Date(
                                                    item.endDate
                                                ).toLocaleDateString()
                                                : "N/A"
                                            }

                                        </td>


                                        <td>

                                            {item.status === "Expired" ? (

                                                <span className="text-danger">
                                                    Expired
                                                </span>

                                            ) : item.membershipPlan?.planName === "Walk-in" ? (

                                                <span className="text-primary">
                                                    Today Only
                                                </span>

                                            ) : item.membershipPlan?.planName === "Yearly" ? (

                                                <span>
                                                    {item.remainingMonths} month(s)
                                                </span>

                                            ) : (

                                                item.remainingDays <= 7 ? (

                                                    <span className="text-warning fw-bold">

                                                        {item.remainingDays} day(s) left

                                                    </span>

                                                ) : (

                                                    <span>

                                                        {item.remainingDays} day(s)

                                                    </span>

                                                )

                                            )}

                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    item.status === "Active"
                                                        ? "status-active"
                                                        : "status-expired"
                                                }
                                            >

                                                {item.status}

                                            </span>

                                        </td>


                                        <td className="d-flex gap-2">

                                            <button
                                                type="button"
                                                className="btn-table-edit"
                                                onClick={() =>
                                                    editMembership(item)
                                                }
                                                title="Edit Membership"
                                            >

                                                <FaEdit />

                                            </button>


                                            {item.membershipPlan &&
                                                item.membershipPlan.planName !== "Walk-in" &&
                                                (
                                                    item.status === "Expired" ||
                                                    item.remainingDays <= 7
                                                ) && (

                                                    <button
                                                        type="button"
                                                        className="btn-table-renew"
                                                        title="Renew Membership"
                                                        onClick={() =>
                                                            renewMembership(
                                                                item.membershipID
                                                            )
                                                        }
                                                    >

                                                        <FaRedoAlt />

                                                    </button>

                                                )}


                                            {role === "Admin" && (

                                                <button
                                                    type="button"
                                                    className="btn-table-delete"
                                                    onClick={() =>
                                                        deleteMembership(
                                                            item.membershipID
                                                        )
                                                    }
                                                    title="Delete Membership"
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


            {/* =========================
                SEPARATE EDIT MEMBERSHIP FORM
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
                        className="page-card"
                        style={{
                            width: "100%",
                            maxWidth: "800px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            backgroundColor: "#fff"
                        }}
                    >

                        <div className="card-header-custom">

                            <h4>

                                <FaEdit className="me-2" />

                                Edit Membership

                            </h4>

                        </div>


                        <form onSubmit={updateMembership}>

                            <div className="row">

                                <div className="col-md-6 mb-3">

                                    <label className="form-label">

                                        Member

                                    </label>

                                    <select
                                        className="form-select"
                                        name="memberID"
                                        value={editForm.memberID}
                                        onChange={handleEditChange}
                                        required
                                    >

                                        <option value="">
                                            Select Member
                                        </option>

                                        {members.map(member => (

                                            <option
                                                key={member.memberID}
                                                value={member.memberID}
                                            >

                                                {member.firstName}{" "}
                                                {member.lastName}

                                            </option>

                                        ))}

                                    </select>

                                </div>


                                <div className="col-md-6 mb-3">

                                    <label className="form-label">

                                        Membership Plan

                                    </label>

                                    <select
                                        className="form-select"
                                        name="planID"
                                        value={editForm.planID}
                                        onChange={handleEditChange}
                                        required
                                    >

                                        <option value="">
                                            Select Plan
                                        </option>

                                        {plans.map(plan => (

                                            <option
                                                key={plan.planID}
                                                value={plan.planID}
                                            >

                                                {plan.planName}

                                            </option>

                                        ))}

                                    </select>

                                </div>


                                <div className="col-md-4 mb-3">

                                    <label className="form-label">

                                        Start Date

                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        name="startDate"
                                        value={editForm.startDate}
                                        onChange={handleEditChange}
                                        required
                                    />

                                </div>


                                <div className="col-md-4 mb-3">

                                    <label className="form-label">

                                        End Date

                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        name="endDate"
                                        value={editForm.endDate}
                                        onChange={handleEditChange}
                                        required
                                    />

                                </div>


                                <div className="col-md-4 mb-3">

                                    <label className="form-label">

                                        Status

                                    </label>

                                    <select
                                        className="form-select"
                                        name="status"
                                        value={editForm.status}
                                        onChange={handleEditChange}
                                        required
                                    >

                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Expired">
                                            Expired
                                        </option>

                                    </select>

                                </div>

                            </div>


                            <button className="btn-add me-2">

                                <FaEdit className="me-2" />

                                Update Membership

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