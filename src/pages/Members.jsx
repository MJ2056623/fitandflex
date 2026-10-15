
import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

import {
    FaUsers,
    FaUserPlus,
    FaEdit,
    FaTrash,
    FaSearch
} from "react-icons/fa";

export default function Members() {
    const role = localStorage.getItem("role");

    const emptyMember = {
        firstName: "",
        lastName: "",
        gender: "",
        birthDate: "",
        phone: "",
        email: "",
        address: ""
    };

    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState(emptyMember);
    const [editForm, setEditForm] = useState(emptyMember);
    const [editingId, setEditingId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadMembers();
    }, []);

    async function loadMembers() {
        try {
            const res = await api.get("/Members");
            setMembers(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;

        if (name === "phone") {
            const numbersOnly = value.replace(/\D/g, "");
            if (numbersOnly.length > 11) return;

            setForm({ ...form, phone: numbersOnly });
            return;
        }

        setForm({ ...form, [name]: value });
    }

    function handleEditChange(e) {
        const { name, value } = e.target;

        if (name === "phone") {
            const numbersOnly = value.replace(/\D/g, "");
            if (numbersOnly.length > 11) return;

            setEditForm({ ...editForm, phone: numbersOnly });
            return;
        }

        setEditForm({ ...editForm, [name]: value });
    }

    function closeCreateModal() {
        setShowCreateModal(false);
        setForm({ ...emptyMember });
    }

    async function saveMember(e) {
        e.preventDefault();

        try {
            await api.post("/Members", form);
            closeCreateModal();
            await loadMembers();
        } catch (err) {
            console.log(err);

            if (err.response) {
                alert(err.response.data);
            } else {
                alert("Unable to add member.");
            }
        }
    }

    function editMember(member) {
        setEditingId(member.memberID);

        setEditForm({
            firstName: member.firstName || "",
            lastName: member.lastName || "",
            gender: member.gender || "",
            birthDate: member.birthDate
                ? member.birthDate.substring(0, 10)
                : "",
            phone: member.phone || "",
            email: member.email || "",
            address: member.address || ""
        });
    }

    async function updateMember(e) {
        e.preventDefault();

        try {
            await api.put(`/Members/${editingId}`, editForm);
            cancelEdit();
            await loadMembers();
        } catch (err) {
            console.log(err);

            if (err.response) {
                alert(err.response.data);
            } else {
                alert("Unable to update member.");
            }
        }
    }

    function cancelEdit() {
        setEditingId(null);
        setEditForm({ ...emptyMember });
    }

    async function deleteMember(id) {
        if (!window.confirm("Delete this member?")) return;

        try {
            await api.delete(`/Members/${id}`);
            await loadMembers();
        } catch (err) {
            console.log(err);
            alert("Unable to delete member.");
        }
    }

    const filteredMembers = members.filter((member) =>
        `${member.firstName} ${member.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        (member.email || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        (member.phone || "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const modalOverlayStyle = {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
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

    return (
        <DashboardLayout>
            {/* PAGE HEADING AND ADD BUTTON */}
            <div className="dashboard-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h1>Members</h1>
                    <p>Manage all registered gym members.</p>
                </div>

                <button
                    type="button"
                    className="btn btn-dark"
                    onClick={() => setShowCreateModal(true)}
                >
                    <FaUserPlus className="me-2" />
                    Add Member
                </button>
            </div>

            {/* ADD MEMBER MODAL */}
            {showCreateModal && (
                <div
                    style={modalOverlayStyle}
                    onClick={closeCreateModal}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Add Member"
                        style={modalStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="panel-title mb-4">
                            <h4 className="mb-0">
                                <FaUserPlus className="me-2" />
                                Add New Member
                            </h4>
                        </div>

                        <form onSubmit={saveMember}>
                            <div className="mb-3">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="First Name"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Last Name"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Gender</label>
                                <select
                                    className="form-select"
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Birth Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="birthDate"
                                    value={form.birthDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    placeholder="09XXXXXXXXX"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    maxLength="11"
                                    pattern="09[0-9]{9}"
                                    title="Phone number must contain exactly 11 digits and start with 09."
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email Address"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label">Complete Address</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Complete Address"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-2 border-top pt-3">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeCreateModal}
                                >
                                    Close
                                </button>

                                <button type="submit" className="btn btn-dark">
                                    <FaUserPlus className="me-2" />
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MEMBERS TABLE */}
            <div className="dashboard-panel">
                <div className="panel-title d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <span>
                        <FaUsers className="me-2" />
                        Registered Members
                    </span>

                    <div style={{ width: "100%", maxWidth: "320px" }}>
                        <div className="input-group">
                            <span className="input-group-text">
                                <FaSearch />
                            </span>

                            <input
                                className="form-control"
                                placeholder="Search member..."
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
                                <th>Full Name</th>
                                <th>Gender</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th style={{ width: "140px" }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
    {filteredMembers.length === 0 ? (
        <tr>
            <td colSpan="8" className="text-center py-4">
                No members found.
            </td>
        </tr>
    ) : (
        filteredMembers.map((member) => (
            <tr key={member.memberID}>
                <td>{member.memberID}</td>

                <td>
                    <strong>
                        {member.firstName} {member.lastName}
                    </strong>
                </td>

                <td>{member.gender}</td>
                <td>{member.email}</td>
                <td>{member.phone}</td>

                <td style={{ maxWidth: "250px", whiteSpace: "normal" }}>
                    {member.address}
                </td>

                <td>
                    <span
                        className={`badge ${
                            (member.status || "").toLowerCase() === "active"
                                ? "bg-success"
                                : "bg-danger"
                        }`}
                        style={{
                            padding: "5px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#fff",
                        }}
                    >
                        {member.status || "Inactive"}
                    </span>
                </td>

                <td>
                    <button
                        type="button"
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => editMember(member)}
                        title="Edit Member"
                    >
                        <FaEdit />
                    </button>

                    {role === "Admin" && (
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteMember(member.memberID)}
                            title="Delete Member"
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

            {/* EDIT MEMBER MODAL */}
            {editingId !== null && (
                <div
                    style={modalOverlayStyle}
                    onClick={cancelEdit}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Edit Member"
                        style={modalStyle}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="panel-title mb-4">
                            <h4 className="mb-0">
                                <FaEdit className="me-2" />
                                Edit Member
                            </h4>
                        </div>

                        <form onSubmit={updateMember}>
                            <div className="mb-3">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="firstName"
                                    value={editForm.firstName}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="lastName"
                                    value={editForm.lastName}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Gender</label>
                                <select
                                    className="form-select"
                                    name="gender"
                                    value={editForm.gender}
                                    onChange={handleEditChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Birth Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="birthDate"
                                    value={editForm.birthDate}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    placeholder="09XXXXXXXXX"
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    maxLength="11"
                                    pattern="09[0-9]{9}"
                                    title="Phone number must contain exactly 11 digits and start with 09."
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={editForm.email}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label">Complete Address</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="address"
                                    value={editForm.address}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>

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
                                    Update Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
