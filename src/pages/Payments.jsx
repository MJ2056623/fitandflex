import { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

import {
    FaMoneyBillWave,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch
} from "react-icons/fa";

export default function Payments() {

    const role = localStorage.getItem("role");

    const emptyPayment = {
        memberID: "",
        membershipID: "",
        amount: ""
    };

    const [payments, setPayments] = useState([]);
    const [members, setMembers] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [plans, setPlans] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [editingPayment, setEditingPayment] = useState(null);

    const [search, setSearch] = useState("");

    // CREATE PAYMENT FORM
    const [form, setForm] = useState(emptyPayment);

    // EDIT PAYMENT FORM
    const [editForm, setEditForm] = useState(emptyPayment);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {

        try {

            const [
                paymentRes,
                memberRes,
                membershipRes,
                planRes
            ] = await Promise.all([

                api.get("/Payments"),
                api.get("/Members"),
                api.get("/Memberships"),
                api.get("/MembershipPlans")

            ]);

            setPayments(paymentRes.data);
            setMembers(memberRes.data);
            setPlans(planRes.data);

            const availableMemberships =
                membershipRes.data.filter(m => {

                    if (m.status !== "Active")
                        return false;

                    if (m.isPaid)
                        return false;

                    return true;

                });

            setMemberships(
                availableMemberships
            );

        }
        catch (err) {

            console.log(err);

        }

    }

    // CREATE PAYMENT FORM
    function handleChange(e) {

        const { name, value } = e.target;

        if (name === "memberID") {

            const membership =
                memberships.find(
                    m =>
                        m.memberID === Number(value)
                );

            if (!membership) {

                setForm({
                    ...form,
                    memberID: value,
                    membershipID: "",
                    amount: ""
                });

                return;

            }

            const plan =
                plans.find(
                    p =>
                        p.planID === membership.planID
                );

            setForm({
                ...form,
                memberID: value,
                membershipID:
                    membership.membershipID,
                amount:
                    plan
                        ? plan.price
                        : ""
            });

            return;

        }

        setForm({
            ...form,
            [name]: value
        });

    }

    // EDIT PAYMENT FORM
    function handleEditChange(e) {

        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });

    }

    // RECORD PAYMENT
    async function savePayment(e) {

        e.preventDefault();

        try {

            const payload = {

                memberID:
                    Number(form.memberID),

                membershipID:
                    Number(form.membershipID),

                amount:
                    Number(form.amount)

            };

            await api.post(
                "/Payments",
                payload
            );

            setForm(emptyPayment);

            await loadData();

        }
        catch (err) {

            console.log(err);

            if (err.response) {

                alert(
                    JSON.stringify(
                        err.response.data
                    )
                );

            }
            else {

                alert(err.message);

            }

        }

    }

    // OPEN SEPARATE EDIT FORM
    function editPayment(payment) {

        setEditingId(
            payment.paymentID
        );

        setEditingPayment(payment);

        setEditForm({

            memberID:
                payment.member
                    ? payment.member.memberID
                    : payment.memberID,

            membershipID:
                payment.membership
                    ? payment.membership.membershipID
                    : payment.membershipID,

            amount:
                payment.amount

        });

    }

    // UPDATE PAYMENT
    async function updatePayment(e) {

        e.preventDefault();

        try {

            const payload = {

                memberID:
                    Number(editForm.memberID),

                membershipID:
                    Number(editForm.membershipID),

                amount:
                    Number(editForm.amount)

            };

            await api.put(
                `/Payments/${editingId}`,
                payload
            );

            cancelEdit();

            await loadData();

        }
        catch (err) {

            console.log(err);

            if (err.response) {

                alert(
                    JSON.stringify(
                        err.response.data
                    )
                );

            }
            else {

                alert(err.message);

            }

        }

    }

    function cancelEdit() {

        setEditingId(null);

        setEditingPayment(null);

        setEditForm(emptyPayment);

    }

    async function deletePayment(id) {

        if (!window.confirm("Delete this payment?"))
            return;

        try {

            await api.delete(
                `/Payments/${id}`
            );

            await loadData();

        }
        catch {

            alert(
                "Unable to delete payment."
            );

        }

    }

    const filteredPayments =
        payments.filter(payment => {

            const member =
                payment.member
                    ? `${payment.member.firstName} ${payment.member.lastName}`
                    : "";

            return member
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                );

        });

    return (

        <DashboardLayout>

            <div className="page-header">

                <div>

                    <h1>

                        <FaMoneyBillWave className="me-2" />

                        Payments

                    </h1>

                    <p>

                        Record and manage member payments.

                    </p>

                </div>

            </div>


            {/* =========================
                RECORD PAYMENT FORM
            ========================== */}

            <div className="page-card">

                <div className="card-header-custom">

                    <h4>
                        Record Payment
                    </h4>

                </div>


                <form onSubmit={savePayment}>

                    <div className="row">

                        {/* MEMBER */}

                        <div className="col-md-4 mb-3">

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

                                {memberships.map(
                                    membership => (

                                        <option
                                            key={
                                                membership.membershipID
                                            }
                                            value={
                                                membership.memberID
                                            }
                                        >

                                            {membership.member
                                                ? `${membership.member.firstName} ${membership.member.lastName}`
                                                : membership.memberID
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* MEMBERSHIP */}

                        <div className="col-md-4 mb-3">

                            <label className="form-label">

                                Membership

                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={

                                    memberships.find(
                                        x =>
                                            x.membershipID ===
                                            Number(
                                                form.membershipID
                                            )
                                    )?.membershipPlan
                                        ?.planName || ""

                                }
                                readOnly
                            />

                        </div>


                        {/* AMOUNT */}

                        <div className="col-md-4 mb-3">

                            <label className="form-label">

                                Amount

                            </label>

                            <input
                                type="number"
                                className="form-control"
                                value={form.amount}
                                readOnly
                            />

                        </div>

                    </div>


                    <div className="mt-3">

                        <button className="btn-add">

                            <FaPlus className="me-2" />

                            Record Payment

                        </button>

                    </div>

                </form>

            </div>


            {/* =========================
                PAYMENT HISTORY
            ========================== */}

            <div className="page-card mt-4">

                <div className="card-header-custom d-flex justify-content-between align-items-center">

                    <h4>
                        Payment History
                    </h4>


                    <div className="search-box">

                        <FaSearch className="search-icon" />

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search member..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
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
                                <th width="170">
                                    Actions
                                </th>

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

                                filteredPayments.map(
                                    payment => (

                                        <tr
                                            key={
                                                payment.paymentID
                                            }
                                        >

                                            <td>

                                                <strong>

                                                    #
                                                    {payment.paymentID}

                                                </strong>

                                            </td>


                                            <td>

                                                {payment.member

                                                    ? `${payment.member.firstName} ${payment.member.lastName}`

                                                    : payment.memberID

                                                }

                                            </td>


                                            <td>

                                                {payment.membership
                                                    ? (

                                                        <>

                                                            <strong>

                                                                {
                                                                    payment.membership.plan
                                                                }

                                                            </strong>


                                                            {
                                                                payment.membership.plan !==
                                                                "Walk-in" && (

                                                                    <div className="text-muted small">

                                                                        {
                                                                            payment.membership.remainingDays
                                                                        }{" "}
                                                                        days left

                                                                    </div>

                                                                )
                                                            }

                                                        </>

                                                    )
                                                    : `#${payment.membershipID}`
                                                }

                                            </td>


                                            <td>

                                                <strong>

                                                    ₱
                                                    {Number(
                                                        payment.amount
                                                    ).toLocaleString()}

                                                </strong>

                                            </td>


                                            <td>

                                                {new Date(
                                                    payment.paymentDate
                                                ).toLocaleDateString()}

                                            </td>


                                            <td>

                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() =>
                                                        editPayment(
                                                            payment
                                                        )
                                                    }
                                                    title="Edit Payment"
                                                >

                                                    <FaEdit />

                                                </button>


                                                {role === "Admin" && (

                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            deletePayment(
                                                                payment.paymentID
                                                            )
                                                        }
                                                        title="Delete Payment"
                                                    >

                                                        <FaTrash />

                                                    </button>

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


            {/* =========================
    EDIT PAYMENT
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

                    Edit Payment

                </h4>


                <form onSubmit={updatePayment}>

                    {/* MEMBER */}

                    <div className="mb-3">

                        <label className="form-label">
                            Member
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={
                                editForm.memberID
                                    ? `${editForm.memberID}`
                                    : ""
                            }
                            readOnly
                        />

                    </div>


                    {/* MEMBERSHIP */}

                    <div className="mb-3">

                        <label className="form-label">
                            Membership
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={
                                editForm.membershipID
                                    ? `${editForm.membershipID}`
                                    : ""
                            }
                            readOnly
                        />

                    </div>


                    {/* AMOUNT */}

                    <div className="mb-4">

                        <label className="form-label">
                            Amount
                        </label>

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


                    <button
                        type="submit"
                        className="btn-add me-2"
                    >

                        <FaEdit className="me-2" />

                        Update Payment

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