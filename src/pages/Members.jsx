import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

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

    const [members, setMembers] = useState([]);

    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        gender: "",
        birthDate: "",
        phone: "",
        email: "",
        address: ""
    });

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

    function handleChange(e) {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    }

    async function saveMember(e) {

        e.preventDefault();

        try {

            if (editingId === null) {

                await api.post("/Members", form);

            }

            else {

                await api.put(`/Members/${editingId}`, form);

            }

            setForm({
                firstName: "",
                lastName: "",
                gender: "",
                birthDate: "",
                phone: "",
                email: "",
                address: ""
            });

            setEditingId(null);

            await loadMembers();

        }

        catch (err) {

            console.log(err);

            if (err.response) {

                alert(err.response.data);

            }

            else {

                alert("Unable to save member.");

            }

        }

    }

    function editMember(member) {

        setEditingId(member.memberID);

        setForm({
            firstName: member.firstName,
            lastName: member.lastName,
            gender: member.gender,
            birthDate: member.birthDate.substring(0,10),
            phone: member.phone,
            email: member.email,
            address: member.address
        });

    }

    async function deleteMember(id) {

        if(!window.confirm("Delete this member?"))
            return;

        try{

            await api.delete(`/Members/${id}`);

            loadMembers();

        }

        catch(err){

            console.log(err);

            alert("Unable to delete member.");

        }

    }

    const filteredMembers = members.filter(member =>

        `${member.firstName} ${member.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||

        member.email.toLowerCase().includes(search.toLowerCase()) ||

        member.phone.toLowerCase().includes(search.toLowerCase())

    );

    return(
        <DashboardLayout>

        <div className="dashboard-header">

            <div>

                <h1>Members</h1>

                <p>
                    Manage all registered gym members.
                </p>

            </div>

            

        </div>

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
                            className="form-control"
                            placeholder="Phone Number"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
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

                            {editingId === null ? "Add Member" : "Update Member"}

                        </button>

                    </div>

                </div>

            </form>

        </div>

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
                            onChange={(e)=>setSearch(e.target.value)}
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
                                colSpan="7"
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

                                        {member.firstName} {member.lastName}

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

                                <td>

                                    <span className="badge success">

                                        {member.status}

                                    </span>

                                </td>

                                <td>

                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => editMember(member)}
                                    >

                                        <FaEdit />

                                    </button>
                                                                        {role === "Admin" && (

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteMember(member.memberID)}
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

    </DashboardLayout>

    );

}