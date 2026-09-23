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

    // ADD MEMBER FORM
    const [form, setForm] = useState(emptyMember);

    // SEPARATE EDIT MEMBER FORM
    const [editForm, setEditForm] = useState(emptyMember);

    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadMembers();
    }, []);

    async function loadMembers() {

        try {

            const res = await api.get("/Members");

            setMembers(res.data);

        }
        catch (err) {

            console.log(err);

        }

    }

    // ADD FORM
    function handleChange(e) {

        const { name, value } = e.target;

        if (name === "phone") {

            const numbersOnly = value.replace(/\D/g, "");

            if (numbersOnly.length > 11) {
                return;
            }

            setForm({
                ...form,
                phone: numbersOnly
            });

            return;
        }

        setForm({
            ...form,
            [name]: value
        });

    }

    // EDIT FORM
    function handleEditChange(e) {

        const { name, value } = e.target;

        if (name === "phone") {

            const numbersOnly = value.replace(/\D/g, "");

            if (numbersOnly.length > 11) {
                return;
            }

            setEditForm({
                ...editForm,
                phone: numbersOnly
            });

            return;
        }

        setEditForm({
            ...editForm,
            [name]: value
        });

    }

    // ADD MEMBER ONLY
    async function saveMember(e) {

        e.preventDefault();

        try {

            await api.post("/Members", form);

            setForm(emptyMember);

            await loadMembers();

        }
        catch (err) {

            console.log(err);

            if (err.response) {
                alert(err.response.data);
            }
            else {
                alert("Unable to add member.");
            }

        }

    }

    // OPEN SEPARATE EDIT FORM
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

    // UPDATE MEMBER
    async function updateMember(e) {

        e.preventDefault();

        try {

            await api.put(
                `/Members/${editingId}`,
                editForm
            );

            cancelEdit();

            await loadMembers();

        }
        catch (err) {

            console.log(err);

            if (err.response) {
                alert(err.response.data);
            }
            else {
                alert("Unable to update member.");
            }

        }

    }

    function cancelEdit() {

        setEditingId(null);
        setEditForm(emptyMember);

    }

    async function deleteMember(id) {

        if (!window.confirm("Delete this member?"))
            return;

        try {

            await api.delete(`/Members/${id}`);

            await loadMembers();

        }
        catch (err) {

            console.log(err);

            alert("Unable to delete member.");

        }

    }

    const filteredMembers = members.filter(member =>

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

    return (

        <DashboardLayout>

            <div className="dashboard-header">

                <div>

                    <h1>Members</h1>

                    <p>
                        Manage all registered gym members.
                    </p>

                </div>

            </div>


            {/* =========================
                ADD MEMBER FORM
            ========================== */}

            <div className="dashboard-panel mb-4">

                <form onSubmit={saveMember}>

                    <div className="row">

                        <div className="col-md-4 mb-3">

                            <input
                                className="form-control"
                                placeholder="First Name"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="col-md-4 mb-3">

                            <input
                                className="form-control"
                                placeholder="Last Name"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="col-md-4 mb-3">

                            <select
                                className="form-select"
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Gender
                                </option>

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
                                    Female
                                </option>

                            </select>

                        </div>


                        <div className="col-md-4 mb-3">

                            <input
                                type="date"
                                className="form-control"
                                name="birthDate"
                                value={form.birthDate}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="col-md-4 mb-3">

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


                        <div className="col-md-4 mb-3">

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


                        <div className="col-md-12 mb-4">

                            <input
                                className="form-control"
                                placeholder="Complete Address"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="col-md-12">

                            <button className="btn-add">

                                <FaUserPlus className="me-2" />

                                Add Member

                            </button>

                        </div>

                    </div>

                </form>

            </div>


            {/* =========================
                MEMBERS TABLE
            ========================== */}

            <div className="dashboard-panel">

                <div className="panel-title">

                    <span>

                        <FaUsers className="me-2" />

                        Registered Members

                    </span>


                    <div style={{ width: "320px" }}>

                        <div className="input-group">

                            <span className="input-group-text">

                                <FaSearch />

                            </span>

                            <input
                                className="form-control"
                                placeholder="Search member..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>

                    </div>

                </div>


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
                            <th width="180">
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredMembers.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="8"
                                    className="text-center py-4"
                                >

                                    No members found.

                                </td>

                            </tr>

                        ) : (

                            filteredMembers.map(member => (

                                <tr key={member.memberID}>

                                    <td>
                                        {member.memberID}
                                    </td>


                                    <td>

                                        <strong>

                                            {member.firstName}{" "}
                                            {member.lastName}

                                        </strong>

                                    </td>


                                    <td>
                                        {member.gender}
                                    </td>


                                    <td>
                                        {member.email}
                                    </td>


                                    <td>
                                        {member.phone}
                                    </td>


                                    <td
                                        style={{
                                            maxWidth: "250px",
                                            whiteSpace: "normal"
                                        }}
                                    >
                                        {member.address}
                                    </td>


                                    <td>

                                        <span
    className={`badge ${
        String(member.status).toLowerCase() === "active"
            ? "bg-success"
            : "bg-secondary"
    }`}
>
    {member.status}
</span>

                                    </td>


                                    <td>

                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() =>
                                                editMember(member)
                                            }
                                            title="Edit Member"
                                        >

                                            <FaEdit />

                                        </button>


                                        {role === "Admin" && (

                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    deleteMember(
                                                        member.memberID
                                                    )
                                                }
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


            {/* =========================
    SEPARATE EDIT MEMBER FORM
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
            className="dashboard-panel"
            style={{
                width: "100%",
                maxWidth: "550px",
                maxHeight: "90vh",
                overflowY: "auto",
                backgroundColor: "#fff"
            }}
        >

            {/* HEADER */}

            <div className="panel-title">

                <span>

                    <FaEdit className="me-2" />

                    Edit Member

                </span>

            </div>


            {/* EDIT FORM */}

            <form onSubmit={updateMember}>

                {/* FIRST NAME */}

                <div className="mb-3">

                    <label className="form-label">
                        First Name
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="First Name"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleEditChange}
                        required
                    />

                </div>


                {/* LAST NAME */}

                <div className="mb-3">

                    <label className="form-label">
                        Last Name
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Last Name"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleEditChange}
                        required
                    />

                </div>


                {/* GENDER */}

                <div className="mb-3">

                    <label className="form-label">
                        Gender
                    </label>

                    <select
                        className="form-select"
                        name="gender"
                        value={editForm.gender}
                        onChange={handleEditChange}
                        required
                    >

                        <option value="">
                            Select Gender
                        </option>

                        <option value="Male">
                            Male
                        </option>

                        <option value="Female">
                            Female
                        </option>

                    </select>

                </div>


                {/* BIRTH DATE */}

                <div className="mb-3">

                    <label className="form-label">
                        Birth Date
                    </label>

                    <input
                        type="date"
                        className="form-control"
                        name="birthDate"
                        value={editForm.birthDate}
                        onChange={handleEditChange}
                        required
                    />

                </div>


                {/* PHONE */}

                <div className="mb-3">

                    <label className="form-label">
                        Phone Number
                    </label>

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


                {/* EMAIL */}

                <div className="mb-3">

                    <label className="form-label">
                        Email Address
                    </label>

                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email Address"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        required
                    />

                </div>


                {/* ADDRESS */}

                <div className="mb-4">

                    <label className="form-label">
                        Complete Address
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Complete Address"
                        name="address"
                        value={editForm.address}
                        onChange={handleEditChange}
                        required
                    />

                </div>


                {/* BUTTONS */}

                <div>

                    <button
                        type="submit"
                        className="btn-add me-2"
                    >

                        <FaEdit className="me-2" />

                        Update Member

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

        </DashboardLayout>

    );

}