import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch,
    FaCalendarCheck
} from "react-icons/fa";

export default function Memberships() {

    const role = localStorage.getItem("role");

    const [memberships, setMemberships] = useState([]);
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        memberID: "",
        planID: "",
        startDate: "",
        endDate: "",
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

    async function saveMembership(e) {

        e.preventDefault();

        try {

            if (editingId === null) {

                await api.post("/Memberships", form);

            }
            else {

                await api.put(`/Memberships/${editingId}`, form);

            }

            resetForm();

            loadData();

        }
        catch (err) {

            console.log(err);

            alert("Unable to save membership.");

        }

    }

    function editMembership(item) {

        setEditingId(item.membershipID);

        setForm({

            memberID: item.memberID,
            planID: item.planID,
            startDate: item.startDate.substring(0,10),
            endDate: item.endDate.substring(0,10),
            status: item.status

        });

    }

    async function deleteMembership(id) {

        if(!window.confirm("Delete this membership?"))
            return;

        try{

            await api.delete(`/Memberships/${id}`);

            loadData();

        }
        catch{

            alert("Unable to delete membership.");

        }

    }

    function resetForm(){

        setEditingId(null);

        setForm({

            memberID:"",
            planID:"",
            startDate:"",
            endDate:"",
            status:"Active"

        });

    }

    const filteredMemberships = memberships.filter(x=>{

        const memberName = x.member
            ? `${x.member.firstName} ${x.member.lastName}`
            : "";

        return memberName
            .toLowerCase()
            .includes(search.toLowerCase());

    });

            return (

        <DashboardLayout>

            <div className="page-header">

                <div>

                    <h1>Memberships</h1>

                    <p>
                        Manage member subscriptions and renewals.
                    </p>

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

                    <div className="mt-3">

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

                    </div>

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
                                <th width="230">Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {memberships.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="text-center py-5"
                                    >

                                        No memberships found.

                                    </td>

                                </tr>

                            ) : (

                                memberships.map(item => (

                                    <tr key={item.membershipID}>

                                        <td>

                                            #{item.membershipID}

                                        </td>

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

                                            {new Date(
                                                item.startDate
                                            ).toLocaleDateString()}

                                        </td>

                                        <td>

                                            {new Date(
                                                item.endDate
                                            ).toLocaleDateString()}

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

                                        <td>

                                            <button
                                                className="btn-table-edit me-2"
                                                onClick={() =>
                                                    editMembership(item)
                                                }
                                            >

                                                Edit

                                            </button>

                                            <button
                                                className="btn-table-renew me-2"
                                                onClick={() =>
                                                    renewMembership(
                                                        item.membershipID
                                                    )
                                                }
                                            >

                                                Renew

                                            </button>

                                            {role === "Admin" && (

                                                <button
                                                    className="btn-table-delete"
                                                    onClick={() =>
                                                        deleteMembership(
                                                            item.membershipID
                                                        )
                                                    }
                                                >

                                                    Delete

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