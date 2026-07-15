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

    const [payments, setPayments] = useState([]);
    const [members, setMembers] = useState([]);
    const [memberships, setMemberships] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        memberID: "",
        membershipID: "",
        amount: ""
    });

    useEffect(() => {

        loadData();

    }, []);

    async function loadData() {

        try {

            const [paymentRes, memberRes, membershipRes] = await Promise.all([

                api.get("/Payments"),
                api.get("/Members"),
                api.get("/Memberships")

            ]);

            setPayments(paymentRes.data);
            setMembers(memberRes.data);
            setMemberships(membershipRes.data);

        }

        catch (err) {

            console.log(err);

        }

    }

    function handleChange(e) {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    }

    async function savePayment(e) {

        e.preventDefault();

        try {

            const payload = {

                memberID: Number(form.memberID),
                membershipID: Number(form.membershipID),
                amount: Number(form.amount)

            };

            if (editingId === null) {

                await api.post("/Payments", payload);

            }

            else {

                await api.put(`/Payments/${editingId}`, payload);

            }

            resetForm();

            loadData();

        }

        catch (err) {

            console.log(err);

            alert("Unable to save payment.");

        }

    }

    function editPayment(payment) {

        setEditingId(payment.paymentID);

        setForm({

            memberID: payment.memberID,
            membershipID: payment.membershipID,
            amount: payment.amount

        });

    }

    async function deletePayment(id) {

        if (!window.confirm("Delete this payment?"))
            return;

        try {

            await api.delete(`/Payments/${id}`);

            loadData();

        }

        catch {

            alert("Unable to delete payment.");

        }

    }

    function resetForm() {

        setEditingId(null);

        setForm({

            memberID: "",
            membershipID: "",
            amount: ""

        });

    }

    const filteredPayments = payments.filter(payment => {

        const member = payment.member
            ? `${payment.member.firstName} ${payment.member.lastName}`
            : "";

        return member
            .toLowerCase()
            .includes(search.toLowerCase());

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

            <div className="page-card">

                <div className="card-header-custom">

                    <h4>

                        {editingId === null
                            ? "Record Payment"
                            : "Update Payment"}

                    </h4>

                </div>

                <form onSubmit={savePayment}>

                    <div className="row">

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

                        <div className="col-md-4 mb-3">

                            <label className="form-label">

                                Membership

                            </label>

                            <select
                                className="form-select"
                                name="membershipID"
                                value={form.membershipID}
                                onChange={handleChange}
                                required
                            >

                                <option value="">

                                    Select Membership

                                </option>

                                {memberships.map(item => (

                                    <option
                                        key={item.membershipID}
                                        value={item.membershipID}
                                    >

                                        Membership #{item.membershipID}

                                    </option>

                                ))}

                            </select>

                        </div>

                        <div className="col-md-4 mb-3">

                            <label className="form-label">

                                Amount

                            </label>

                            <input
                                type="number"
                                className="form-control"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="Enter amount"
                                required
                            />

                        </div>

                    </div>

                    <div className="mt-3">

                        <button className="btn-add">

                            <FaPlus className="me-2" />

                            {editingId === null
                                ? "Record Payment"
                                : "Update Payment"}

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

                    </div>

                </form>

            </div>

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

                                filteredPayments.map(payment => (

                                    <tr key={payment.paymentID}>

                                        <td>

                                            <strong>

                                                #{payment.paymentID}

                                            </strong>

                                        </td>

                                        <td>

                                            {payment.member
                                                ? `${payment.member.firstName} ${payment.member.lastName}`
                                                : payment.memberID}

                                        </td>

                                        <td>

                                            #{payment.membershipID}

                                        </td>

                                        <td>

                                            <strong>

                                                ₱{Number(payment.amount).toLocaleString()}

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
                                                    editPayment(payment)
                                                }
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