
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";
import { FaEdit, FaTrash, FaRedoAlt } from "react-icons/fa";

const emptyMembership = {
    memberID: "",
    planID: "",
    startDate: "",
    endDate: "",
    status: "Active",
};

const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1050,
    padding: "20px",
    overflowY: "auto",
};

const modalStyle = {
    width: "100%",
    maxWidth: "850px",
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
};

const fieldStyle = {
    marginBottom: "20px",
};

export default function Memberships() {
    const role = localStorage.getItem("role");
    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get("status");

    const [memberships, setMemberships] = useState([]);
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);

    const [form, setForm] = useState({ ...emptyMembership });
    const [editForm, setEditForm] = useState({ ...emptyMembership });

    const [editingId, setEditingId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [membershipRes, memberRes, planRes] =
                await Promise.all([
                    api.get("/Memberships"),
                    api.get("/Members"),
                    api.get("/MembershipPlans"),
                ]);

            setMemberships(membershipRes.data);
            setMembers(memberRes.data);
            setPlans(planRes.data);
        } catch (err) {
            console.error(err);
            alert("Unable to load membership data.");
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function handleEditChange(e) {
        const { name, value } = e.target;
        setEditForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function closeCreateModal() {
        setShowCreateModal(false);
        setForm({ ...emptyMembership });
    }

    function cancelEdit() {
        setEditingId(null);
        setEditForm({ ...emptyMembership });
    }

    const filteredMemberships = memberships.filter((membership) => {
        if (!statusFilter) return true;

        return (
            membership.status &&
            membership.status.toLowerCase() === statusFilter.toLowerCase()
        );
    });

    async function saveMembership(e) {
        e.preventDefault();

        if (!form.memberID || !form.planID) {
            alert("Please select a member and membership plan.");
            return;
        }

        try {
            const payload = {
                memberID: Number(form.memberID),
                planID: Number(form.planID),
            };

            await api.post("/Memberships", payload);

            closeCreateModal();
            await loadData();

            alert("Membership created successfully.");
        } catch (err) {
            console.error(err);

            if (err.response) {
                alert(
                    typeof err.response.data === "string"
                        ? err.response.data
                        : JSON.stringify(err.response.data)
                );
            } else {
                alert(err.message || "Unable to create membership.");
            }
        }
    }

    function editMembership(item) {
        setEditingId(item.membershipID);

        setEditForm({
            memberID:
                item.memberID ?? item.member?.memberID ?? "",
            planID:
                item.planID ??
                item.membershipPlan?.planID ??
                "",
            startDate: item.startDate
                ? item.startDate.substring(0, 10)
                : "",
            endDate: item.endDate
                ? item.endDate.substring(0, 10)
                : "",
            status: item.status || "Active",
        });
    }

    async function updateMembership(e) {
        e.preventDefault();

        if (!editForm.memberID || !editForm.planID) {
            alert("Please select a member and membership plan.");
            return;
        }

        if (
            editForm.startDate &&
            editForm.endDate &&
            editForm.endDate < editForm.startDate
        ) {
            alert("End Date cannot be earlier than Start Date.");
            return;
        }

        try {
            const payload = {
                memberID: Number(editForm.memberID),
                planID: Number(editForm.planID),
                startDate: editForm.startDate || null,
                endDate: editForm.endDate || null,
                status: editForm.status,
            };

            await api.put(`/Memberships/${editingId}`, payload);

            cancelEdit();
            await loadData();

            alert("Membership updated successfully.");
        } catch (err) {
            console.error(err);

            if (err.response) {
                alert(
                    typeof err.response.data === "string"
                        ? err.response.data
                        : JSON.stringify(err.response.data)
                );
            } else {
                alert(err.message || "Unable to update membership.");
            }
        }
    }

    async function deleteMembership(id) {
        if (!window.confirm("Delete this membership?")) return;

        try {
            await api.delete(`/Memberships/${id}`);
            await loadData();
            alert("Membership deleted successfully.");
        } catch (err) {
            console.error(err);
            alert("Unable to delete membership.");
        }
    }

    async function renewMembership(id) {
        if (
            !window.confirm(
                "Renew this membership?\n\nThe membership period will restart from today."
            )
        ) {
            return;
        }

        try {
            await api.put(`/Memberships/renew/${id}`);

            await loadData();
            alert("Membership renewed successfully.");
        } catch (err) {
            console.error(err);

            if (err.response) {
                alert(
                    typeof err.response.data === "string"
                        ? err.response.data
                        : JSON.stringify(err.response.data)
                );
            } else {
                alert(err.message || "Unable to renew membership.");
            }
        }
    }

    function formatDate(date) {
        if (!date) return "-";

        return new Date(date).toLocaleDateString();
    }

    function getRemainingText(item) {
        if (
            item.remainingDays === null ||
            item.remainingDays === undefined
        ) {
            return "-";
        }

        const days = Number(item.remainingDays);

        if (days <= 0) return "Expired";
        if (days === 1) return "1 day left";
        if (days < 30) return `${days} day(s)`;

        const months = Math.round((days / 30) * 10) / 10;
        return `${months} month(s)`;
    }

    function getMemberName(item) {
        const member =
            item.member ||
            members.find(
                (m) =>
                    Number(m.memberID) === Number(item.memberID)
            );

        return member
            ? `${member.firstName} ${member.lastName}`
            : "Unknown Member";
    }

    function getPlanName(item) {
        const plan =
            item.membershipPlan ||
            plans.find(
                (p) => Number(p.planID) === Number(item.planID)
            );

        return plan?.planName || "Unknown Plan";
    }

    function MembershipFields({ values, onChange, isEditing = false }) {
        return (
            <>
                <div style={fieldStyle}>
                    <label className="form-label">Member</label>
                    <select
                        className="form-select"
                        name="memberID"
                        value={values.memberID}
                        onChange={onChange}
                        required
                    >
                        <option value="">Select Member</option>
                        {members.map((member) => (
                            <option
                                key={member.memberID}
                                value={member.memberID}
                            >
                                {member.firstName} {member.lastName}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={fieldStyle}>
                    <label className="form-label">
                        Membership Plan
                    </label>
                    <select
                        className="form-select"
                        name="planID"
                        value={values.planID}
                        onChange={onChange}
                        required
                    >
                        <option value="">Select Membership Plan</option>
                        {plans.map((plan) => (
                            <option
                                key={plan.planID}
                                value={plan.planID}
                            >
                                {plan.planName}
                            </option>
                        ))}
                    </select>
                </div>

                {isEditing && (
                    <>
                        <div style={fieldStyle}>
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="startDate"
                                value={values.startDate}
                                onChange={onChange}
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="endDate"
                                min={values.startDate || undefined}
                                value={values.endDate}
                                onChange={onChange}
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                name="status"
                                value={values.status}
                                onChange={onChange}
                            >
                                <option value="Active">Active</option>
                                <option value="Expired">Expired</option>
                            </select>
                        </div>
                    </>
                )}
            </>
        );
    }

    return (
        <DashboardLayout>
            {/* PAGE HEADER */}
            <div
                className="page-header"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "24px",
                }}
            >
                <div>
                    <h1>Memberships</h1>
                    <p>Manage member subscriptions and renewals.</p>
                </div>

                <button
                    type="button"
                    className="btn btn-dark"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create Membership
                </button>
            </div>

            {/* CREATE MEMBERSHIP MODAL */}
            {showCreateModal && (
                <div
                    style={modalOverlayStyle}
                    onClick={closeCreateModal}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Create Membership"
                        style={modalStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ padding: "32px" }}>
                            <h4
                                style={{
                                    color: "#081C45",
                                    fontWeight: 700,
                                    marginBottom: "24px",
                                }}
                            >
                                Create Membership
                            </h4>

                            <form onSubmit={saveMembership}>
                                <MembershipFields
                                    values={form}
                                    onChange={handleChange}
                                />

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        justifyContent: "flex-end",
                                        flexWrap: "wrap",
                                        marginTop: "28px",
                                    }}
                                >
                                    <button
                                        type="submit"
                                        className="btn btn-dark"
                                    >
                                        Create Membership
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeCreateModal}
                                    >
                                        Close
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MEMBERSHIP LIST */}
            <div className="page-card">
                <div className="card-header-custom">
                    <h4>
                        {statusFilter
                            ? `${statusFilter} Memberships`
                            : "Membership List"}
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
                                <th style={{ minWidth: "150px" }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredMemberships.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        {statusFilter
                                            ? `No ${statusFilter} memberships found.`
                                            : "No memberships found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredMemberships.map((item) => {
                                    const planName = getPlanName(item);
                                    const isWalkIn =
                                        planName.toLowerCase() === "walk-in";

                                    const remainingDays =
                                        item.remainingDays == null
                                            ? null
                                            : Number(item.remainingDays);

                                    const canRenew =
                                        !isWalkIn &&
                                        (item.status === "Expired" ||
                                            (remainingDays !== null &&
                                                remainingDays <= 7));

                                    return (
                                        <tr
                                            key={item.membershipID}
                                            className={
                                                item.status === "Expired"
                                                    ? "table-danger"
                                                    : ""
                                            }
                                        >
                                            <td>#{item.membershipID}</td>

                                            <td>{getMemberName(item)}</td>

                                            <td>
                                                <strong>{planName}</strong>
                                                {!isWalkIn &&
                                                    remainingDays !== null &&
                                                    remainingDays > 0 && (
                                                        <div
                                                            style={{
                                                                fontSize: "12px",
                                                                color: "#777",
                                                            }}
                                                        >
                                                            {remainingDays} day(s) left
                                                        </div>
                                                    )}
                                            </td>

                                            <td>{formatDate(item.startDate)}</td>
                                            <td>{formatDate(item.endDate)}</td>
                                            <td>{getRemainingText(item)}</td>

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

                                            <td>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "8px",
                                                        alignItems: "center",
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        className="btn btn-warning btn-sm"
                                                        title="Edit Membership"
                                                        aria-label="Edit Membership"
                                                        onClick={() =>
                                                            editMembership(item)
                                                        }
                                                    >
                                                        <FaEdit />
                                                    </button>

                                                    {canRenew && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-success btn-sm"
                                                            title="Renew Membership"
                                                            aria-label="Renew Membership"
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
                                                            className="btn btn-danger btn-sm"
                                                            title="Delete Membership"
                                                            aria-label="Delete Membership"
                                                            onClick={() =>
                                                                deleteMembership(
                                                                    item.membershipID
                                                                )
                                                            }
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDIT MEMBERSHIP MODAL */}
            {editingId !== null && (
                <div
                    style={modalOverlayStyle}
                    onClick={cancelEdit}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Edit Membership"
                        style={modalStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ padding: "32px" }}>
                            <h4
                                style={{
                                    color: "#081C45",
                                    fontWeight: 700,
                                    marginBottom: "24px",
                                }}
                            >
                                <FaEdit style={{ marginRight: "10px" }} />
                                Edit Membership
                            </h4>

                            <form onSubmit={updateMembership}>
                                <MembershipFields
                                    values={editForm}
                                    onChange={handleEditChange}
                                    isEditing
                                />

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        justifyContent: "flex-end",
                                        flexWrap: "wrap",
                                        marginTop: "28px",
                                    }}
                                >
                                    <button
                                        type="submit"
                                        className="btn btn-dark"
                                    >
                                        Update Membership
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={cancelEdit}
                                    >
                                        Close
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
