
import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";
import {
    FaMoneyBillWave,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
} from "react-icons/fa";

const emptyPayment = {
    memberID: "",
    membershipID: "",
    amount: "",
};

const overlayStyle = {
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

function PaymentModal({ title, children, onClose }) {
    return (
        <div style={overlayStyle} onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                style={modalStyle}
                onClick={(event) => event.stopPropagation()}
            >
                <div style={{ padding: "32px" }}>
                    <h4
                        style={{
                            color: "#081C45",
                            fontWeight: 700,
                            marginBottom: "24px",
                        }}
                    >
                        {title}
                    </h4>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function Payments() {
    const role = localStorage.getItem("role");

    const [payments, setPayments] = useState([]);
    const [members, setMembers] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [plans, setPlans] = useState([]);

    const [form, setForm] = useState({ ...emptyPayment });
    const [editForm, setEditForm] = useState({ ...emptyPayment });

    const [editingId, setEditingId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [
                paymentRes,
                memberRes,
                membershipRes,
                planRes,
            ] = await Promise.all([
                api.get("/Payments"),
                api.get("/Members"),
                api.get("/Memberships"),
                api.get("/MembershipPlans"),
            ]);

            setPayments(paymentRes.data);
            setMembers(memberRes.data);
            setPlans(planRes.data);

            const availableMemberships = membershipRes.data.filter(
                (membership) =>
                    membership.status === "Active" &&
                    !membership.isPaid
            );

            setMemberships(availableMemberships);
        } catch (err) {
            console.error(err);
            alert("Unable to load payment data.");
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;

        if (name === "memberID") {
            const membership = memberships.find(
                (item) => Number(item.memberID) === Number(value)
            );

            if (!membership) {
                setForm((previous) => ({
                    ...previous,
                    memberID: value,
                    membershipID: "",
                    amount: "",
                }));
                return;
            }

            const plan = plans.find(
                (item) =>
                    Number(item.planID) === Number(membership.planID)
            );

            setForm((previous) => ({
                ...previous,
                memberID: value,
                membershipID: String(membership.membershipID),
                amount: plan ? String(plan.price) : "",
            }));

            return;
        }

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
        setForm({ ...emptyPayment });
    }

    function cancelEdit() {
        setEditingId(null);
        setEditForm({ ...emptyPayment });
    }

    async function savePayment(e) {
        e.preventDefault();

        if (!form.memberID || !form.membershipID || !form.amount) {
            alert("Please select a member with an unpaid active membership.");
            return;
        }

        try {
            const payload = {
                memberID: Number(form.memberID),
                membershipID: Number(form.membershipID),
                amount: Number(form.amount),
            };

            await api.post("/Payments", payload);

            closeCreateModal();
            await loadData();

            alert("Payment recorded successfully.");
        } catch (err) {
            console.error(err);

            alert(
                err.response
                    ? JSON.stringify(err.response.data)
                    : err.message || "Unable to record payment."
            );
        }
    }

    function editPayment(payment) {
        setEditingId(payment.paymentID);

        setEditForm({
            memberID: payment.member
                ? String(payment.member.memberID)
                : String(payment.memberID ?? ""),
            membershipID: payment.membership
                ? String(payment.membership.membershipID)
                : String(payment.membershipID ?? ""),
            amount: String(payment.amount ?? ""),
        });
    }

    async function updatePayment(e) {
        e.preventDefault();

        if (
            editForm.amount === "" ||
            !Number.isFinite(Number(editForm.amount)) ||
            Number(editForm.amount) < 0
        ) {
            alert("Please enter a valid payment amount.");
            return;
        }

        try {
            const payload = {
                memberID: Number(editForm.memberID),
                membershipID: Number(editForm.membershipID),
                amount: Number(editForm.amount),
            };

            await api.put(`/Payments/${editingId}`, payload);

            cancelEdit();
            await loadData();

            alert("Payment updated successfully.");
        } catch (err) {
            console.error(err);

            alert(
                err.response
                    ? JSON.stringify(err.response.data)
                    : err.message || "Unable to update payment."
            );
        }
    }

    async function deletePayment(id) {
        if (!window.confirm("Delete this payment?")) return;

        try {
            await api.delete(`/Payments/${id}`);
            await loadData();
            alert("Payment deleted successfully.");
        } catch (err) {
            console.error(err);
            alert("Unable to delete payment.");
        }
    }

    function getMemberName(payment) {
        const member =
            payment.member ||
            members.find(
                (item) =>
                    Number(item.memberID) === Number(payment.memberID)
            );

        return member
            ? `${member.firstName} ${member.lastName}`
            : payment.memberID ?? "Unknown Member";
    }

    function getMembershipName(payment) {
        if (payment.membership) {
            return payment.membership.plan ||
                payment.membership.membershipPlan?.planName ||
                `#${payment.membership.membershipID}`;
        }

        return `#${payment.membershipID}`;
    }

    const filteredPayments = payments.filter((payment) =>
        getMemberName(payment)
            .toString()
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            {/* PAGE HEADER */}
            <div
                className="page-header"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginBottom: "24px",
                }}
            >
                <div>
                    <h1>
                        <FaMoneyBillWave className="me-2" />
                        Payments
                    </h1>
                    <p>Record and manage member payments.</p>
                </div>

                <button
                    type="button"
                    className="btn btn-dark"
                    onClick={() => setShowCreateModal(true)}
                >
                    <FaPlus className="me-2" />
                    Record Payment
                </button>
            </div>

            {/* CREATE PAYMENT MODAL */}
            {showCreateModal && (
                <PaymentModal
                    title="Record Payment"
                    onClose={closeCreateModal}
                >
                    <form onSubmit={savePayment}>
                        <div style={fieldStyle}>
                            <label className="form-label">Member</label>
                            <select
                                className="form-select"
                                name="memberID"
                                value={form.memberID}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Member</option>

                                {memberships.map((membership) => {
                                    const member =
                                        membership.member ||
                                        members.find(
                                            (item) =>
                                                Number(item.memberID) ===
                                                Number(membership.memberID)
                                        );

                                    return (
                                        <option
                                            key={membership.membershipID}
                                            value={membership.memberID}
                                        >
                                            {member
                                                ? `${member.firstName} ${member.lastName}`
                                                : `Member #${membership.memberID}`}
                                        </option>
                                    );
                                })}
                            </select>

                            {memberships.length === 0 && (
                                <small className="text-muted">
                                    No unpaid active memberships are available.
                                </small>
                            )}
                        </div>

                        <div style={fieldStyle}>
                            <label className="form-label">Membership</label>
                            <input
                                type="text"
                                className="form-control"
                                value={
                                    memberships.find(
                                        (item) =>
                                            Number(item.membershipID) ===
                                            Number(form.membershipID)
                                    )?.membershipPlan?.planName ||
                                    plans.find(
                                        (plan) =>
                                            Number(plan.planID) ===
                                            Number(
                                                memberships.find(
                                                    (item) =>
                                                        Number(item.membershipID) ===
                                                        Number(form.membershipID)
                                                )?.planID
                                            )
                                    )?.planName ||
                                    ""
                                }
                                readOnly
                                placeholder="Select a member first"
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label className="form-label">Amount (₱)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={form.amount}
                                readOnly
                                placeholder="Automatically determined by plan"
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                                flexWrap: "wrap",
                                marginTop: "28px",
                            }}
                        >
                            <button
                                type="submit"
                                className="btn btn-dark"
                                disabled={
                                    memberships.length === 0 ||
                                    !form.membershipID
                                }
                            >
                                <FaPlus className="me-2" />
                                Record Payment
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
                </PaymentModal>
            )}

            {/* PAYMENT HISTORY */}
            <div className="page-card">
                <div
                    className="card-header-custom"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                    }}
                >
                    <h4>Payment History</h4>

                    <div
                        className="search-box"
                        style={{ minWidth: "220px", maxWidth: "320px" }}
                    >
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search member..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Member</th>
                                <th>Membership</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th style={{ minWidth: "120px" }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="text-center py-5"
                                    >
                                        No payments found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.paymentID}>
                                        <td>
                                            <strong>
                                                #{payment.paymentID}
                                            </strong>
                                        </td>

                                        <td>{getMemberName(payment)}</td>

                                        <td>{getMembershipName(payment)}</td>

                                        <td>
                                            <strong>
                                                ₱
                                                {Number(
                                                    payment.amount
                                                ).toLocaleString("en-PH", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </strong>
                                        </td>

                                        <td>
                                            {payment.paymentDate
                                                ? new Date(
                                                      payment.paymentDate
                                                  ).toLocaleDateString()
                                                : "-"}
                                        </td>

                                        <td>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "8px",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    className="btn btn-warning btn-sm"
                                                    title="Edit Payment"
                                                    aria-label="Edit Payment"
                                                    onClick={() =>
                                                        editPayment(payment)
                                                    }
                                                >
                                                    <FaEdit />
                                                </button>

                                                {role === "Admin" && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        title="Delete Payment"
                                                        aria-label="Delete Payment"
                                                        onClick={() =>
                                                            deletePayment(
                                                                payment.paymentID
                                                            )
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDIT PAYMENT MODAL */}
            {editingId !== null && (
                <PaymentModal
                    title={
                        <>
                            <FaEdit className="me-2" />
                            Edit Payment
                        </>
                    }
                    onClose={cancelEdit}
                >
                    <form onSubmit={updatePayment}>
                        <div style={fieldStyle}>
                            <label className="form-label">Member</label>
                            <input
                                type="text"
                                className="form-control"
                                value={getMemberName({
                                    memberID: editForm.memberID,
                                })}
                                readOnly
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label className="form-label">Membership</label>
                            <input
                                type="text"
                                className="form-control"
                                value={
                                    getMembershipName({
                                        membershipID: editForm.membershipID,
                                    })
                                }
                                readOnly
                            />
                        </div>

                        <div style={fieldStyle}>
                            <label className="form-label">Amount (₱)</label>
                            <input
                                type="number"
                                className="form-control"
                                name="amount"
                                value={editForm.amount}
                                onChange={handleEditChange}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                                flexWrap: "wrap",
                                marginTop: "28px",
                            }}
                        >
                            <button type="submit" className="btn btn-dark">
                                <FaEdit className="me-2" />
                                Update Payment
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
                </PaymentModal>
            )}
        </DashboardLayout>
    );
}
