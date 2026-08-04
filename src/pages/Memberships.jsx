import { useEffect, useState } from "react";
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

    const [memberships, setMemberships] = useState([]);
const [members, setMembers] = useState([]);
const [plans, setPlans] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
    memberID: "",
    planID: "",
    startDate: null,
    endDate: null,
    status: "Active"
});

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [membershipRes, memberRes, planRes] = await Promise.all([
                api.get("/Memberships"),
                api.get("/Members"),
                api.get("/MembershipPlans")
            ]);

            setMemberships(membershipRes.data);
            setMembers(memberRes.data);
            setPlans(planRes.data);
        } catch (err) {
            console.log(err);
        }
    }

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function saveMembership(e) {
    e.preventDefault();

    try {

        if (editingId === null) {

            const payload = {
                memberID: parseInt(form.memberID),
                planID: parseInt(form.planID)
            };

            console.log("POST Payload:", payload);

            await api.post("/Memberships", payload);

        } else {

            const payload = {
                memberID: parseInt(form.memberID),
                planID: parseInt(form.planID),
                startDate: form.startDate || null,
                endDate: form.endDate || null,
                status: form.status
            };

            console.log("PUT Payload:", payload);

            await api.put(`/Memberships/${editingId}`, payload);
        }

        resetForm();
        loadData();

    } catch (err) {
        console.log(err);

        if (err.response) {
            console.log(err.response.data);
            alert(JSON.stringify(err.response.data));
        } else {
            alert(err.message);
        }
    }
}

    function editMembership(item) {

    setEditingId(item.membershipID);

    setForm({
        memberID: item.memberID,
        planID: item.planID,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status
    });
}

    async function deleteMembership(id) {
        if (!window.confirm("Delete this membership?")) return;

        try {
            await api.delete(`/Memberships/${id}`);
            loadData();
        } catch (err) {
            console.log(err);
            alert("Unable to delete membership.");
        }
    }

    async function renewMembership(id) {

    if (!window.confirm("Renew this membership?"))
        return;

    try {

        const response = await api.put(`/Memberships/renew/${id}`);

        console.log(response.data);

        alert("Membership renewed successfully.");

        loadData();

    } catch (err) {

        console.log(err);

        if (err.response) {
            console.log(err.response.data);
            alert(JSON.stringify(err.response.data));
        } else {
            alert(err.message);
        }
    }
}

    function resetForm() {

    setEditingId(null);

    setForm({
        memberID: "",
        planID: "",
        startDate: null,
        endDate: null,
        status: "Active"
    });
}

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1>Memberships</h1>
                    <p>Manage member subscriptions and renewals.</p>
                </div>
            </div>

            <div className="page-card">
                <div className="card-header-custom">
                    <h4>
                        {editingId === null
                            ? "Create Membership"
                            : "Update Membership"}
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
                                        {member.firstName} {member.lastName}
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
                        {editingId === null
                            ? "Create Membership"
                            : "Update Membership"}
                    </button>

                    {editingId !== null && (
                        <button
                            type="button"
                            className="btn-report ms-3"
                            onClick={resetForm}
                        >
                            Cancel
                        </button>
                    )}
                </form>
            </div>

            <div className="page-card mt-4">
                <div className="card-header-custom">
                    <h4>Membership List</h4>
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
                                <th>Status</th>
                                <th width="220">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {memberships.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        No memberships found.
                                    </td>
                                </tr>
                            ) : (
                                filteredMemberships.map(item => (
                                    <tr key={item.membershipID}>
                                        <td>#{item.membershipID}</td>

                                        <td>
                                            {item.member
                                                ? `${item.member.firstName} ${item.member.lastName}`
                                                : item.memberID}
                                        </td>

                                        <td>
                                            {item.membershipPlan
                                                ? item.membershipPlan.planName
                                                : item.planID}
                                        </td>

                                        <td>
                                            {new Date(item.startDate).toLocaleDateString()}
                                        </td>

                                        <td>
                                            {new Date(item.endDate).toLocaleDateString()}
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
        title="Edit"
        onClick={() => editMembership(item)}
    >
        <FaEdit />
    </button>

    <button
        type="button"
        className="btn-table-renew"
        title="Renew"
        onClick={() => renewMembership(item.membershipID)}
    >
        <FaRedoAlt />
    </button>

    {role === "Admin" && (
        <button
            type="button"
            className="btn-table-delete"
            title="Delete"
            onClick={() => deleteMembership(item.membershipID)}
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
        </DashboardLayout>
    );
}