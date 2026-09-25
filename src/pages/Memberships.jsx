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


    // =========================================================
    // EMPTY FORM
    // =========================================================

    const emptyMembership = {
        memberID: "",
        planID: "",
        startDate: "",
        endDate: "",
        status: "Active"
    };


    // =========================================================
    // DATA
    // =========================================================

    const [memberships, setMemberships] = useState([]);
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);


    // =========================================================
    // CREATE FORM
    // =========================================================

    const [form, setForm] = useState({
        memberID: "",
        planID: "",
        startDate: "",
        endDate: "",
        status: "Active"
    });


    // =========================================================
    // EDIT FORM
    // =========================================================

    const [editForm, setEditForm] = useState({
        memberID: "",
        planID: "",
        startDate: "",
        endDate: "",
        status: "Active"
    });

    const [editingId, setEditingId] = useState(null);


    // =========================================================
    // LOAD DATA
    // =========================================================

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


    // =========================================================
    // CREATE FORM CHANGE
    // =========================================================

    function handleChange(e) {

        const { name, value } = e.target;

        setForm({

            ...form,

            [name]: value

        });

    }


    // =========================================================
    // EDIT FORM CHANGE
    // =========================================================

    function handleEditChange(e) {

        const { name, value } = e.target;

        setEditForm({

            ...editForm,

            [name]: value

        });

    }


    // =========================================================
    // FILTER
    // =========================================================

    const filteredMemberships = memberships.filter(m => {

        if (!statusFilter)
            return true;

        return (

            m.status &&

            m.status.toLowerCase() ===
            statusFilter.toLowerCase()

        );

    });


    // =========================================================
    // CREATE MEMBERSHIP
    // =========================================================

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


            // Reset CREATE form
            resetForm();


            // Reload list
            await loadData();


            alert("Membership created successfully.");

        }
        catch (err) {

            console.log(err);

            if (err.response) {

                alert(
                    typeof err.response.data === "string"
                        ? err.response.data
                        : JSON.stringify(err.response.data)
                );

            }
            else {

                alert(err.message);

            }

        }

    }


    // =========================================================
    // RESET CREATE FORM
    // =========================================================

    function resetForm() {

        setForm({

            memberID: "",
            planID: "",
            startDate: "",
            endDate: "",
            status: "Active"

        });

    }


    // =========================================================
    // OPEN EDIT MEMBERSHIP MODAL
    // =========================================================

    function editMembership(item) {

        setEditingId(item.membershipID);


        setEditForm({

            memberID:
                item.memberID ||
                item.member?.memberID ||
                "",

            planID:
                item.planID ||
                item.membershipPlan?.planID ||
                "",

            startDate:
                item.startDate
                    ? item.startDate.substring(0, 10)
                    : "",

            endDate:
                item.endDate
                    ? item.endDate.substring(0, 10)
                    : "",

            status:
                item.status ||
                "Active"

        });

    }


    // =========================================================
    // CLOSE EDIT MODAL
    // =========================================================

    function cancelEdit() {

        setEditingId(null);

        setEditForm({

            memberID: "",
            planID: "",
            startDate: "",
            endDate: "",
            status: "Active"

        });

    }


    // =========================================================
    // UPDATE MEMBERSHIP
    // =========================================================

    async function updateMembership(e) {

        e.preventDefault();

        try {

            const payload = {

                memberID:
                    Number(editForm.memberID),

                planID:
                    Number(editForm.planID),

                startDate:
                    editForm.startDate,

                endDate:
                    editForm.endDate,

                status:
                    editForm.status

            };


            await api.put(

                `/Memberships/${editingId}`,

                payload

            );


            cancelEdit();

            await loadData();


            alert(
                "Membership updated successfully."
            );

        }
        catch (err) {

            console.log(err);

            if (err.response) {

                alert(

                    typeof err.response.data === "string"

                        ? err.response.data

                        : JSON.stringify(
                            err.response.data
                        )

                );

            }
            else {

                alert(err.message);

            }

        }

    }


    // =========================================================
    // DELETE MEMBERSHIP
    // =========================================================

    async function deleteMembership(id) {

        if (
            !window.confirm(
                "Delete this membership?"
            )
        ) {

            return;

        }


        try {

            await api.delete(
                `/Memberships/${id}`
            );


            await loadData();

        }
        catch (err) {

            console.log(err);

            alert(
                "Unable to delete membership."
            );

        }

    }


    // =========================================================
    // RENEW MEMBERSHIP
    // =========================================================

    async function renewMembership(id) {

        if (

            !window.confirm(

                "Renew this membership?\n\n" +
                "The membership period will restart from today."

            )

        ) {

            return;

        }


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

            if (err.response) {

                alert(

                    typeof err.response.data === "string"

                        ? err.response.data

                        : JSON.stringify(
                            err.response.data
                        )

                );

            }
            else {

                alert(err.message);

            }

        }

    }


    // =========================================================
    // DATE FORMAT
    // =========================================================

    function formatDate(date) {

        if (!date)
            return "-";


        return new Date(date)
            .toLocaleDateString();

    }


    // =========================================================
    // REMAINING TIME
    // =========================================================

    function getRemainingText(item) {

        if (
            item.remainingDays === null ||
            item.remainingDays === undefined
        ) {

            return "-";

        }


        const days = Number(
            item.remainingDays
        );


        if (days <= 0) {

            return "Expired";

        }


        if (days === 1) {

            return "1 day left";

        }


        if (days < 30) {

            return `${days} day(s)`;

        }


        const months =
            Math.round(
                (days / 30) * 10
            ) / 10;


        return `${months} month(s)`;

    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <DashboardLayout>


            {/* =================================================
                PAGE HEADER
            ================================================= */}

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



            {/* =================================================
                CREATE MEMBERSHIP
            ================================================= */}

            <div className="page-card">

                <div className="card-header-custom">

                    <h4>
                        Create Membership
                    </h4>

                </div>


                <form
                    onSubmit={saveMembership}
                >

                    <div className="row">


                        {/* MEMBER */}

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

                                        key={
                                            member.memberID
                                        }

                                        value={
                                            member.memberID
                                        }

                                    >

                                        {member.firstName}{" "}
                                        {member.lastName}

                                    </option>

                                ))}

                            </select>

                        </div>



                        {/* PLAN */}

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

                                        key={
                                            plan.planID
                                        }

                                        value={
                                            plan.planID
                                        }

                                    >

                                        {plan.planName}

                                    </option>

                                ))}

                            </select>

                        </div>

                    </div>



                    <button
                        type="submit"
                        className="btn-add"
                    >

                        Create Membership

                    </button>


                </form>

            </div>



            {/* =================================================
                MEMBERSHIP LIST
            ================================================= */}

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

                                <th>
                                    ID
                                </th>

                                <th>
                                    Member
                                </th>

                                <th>
                                    Plan
                                </th>

                                <th>
                                    Start Date
                                </th>

                                <th>
                                    End Date
                                </th>

                                <th>
                                    Remaining
                                </th>

                                <th>
                                    Status
                                </th>

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

                                        key={
                                            item.membershipID
                                        }

                                        className={
                                            item.status === "Expired"
                                                ? "table-danger"
                                                : ""
                                        }

                                    >


                                        {/* ID */}

                                        <td>

                                            #
                                            {item.membershipID}

                                        </td>



                                        {/* MEMBER */}

                                        <td>

                                            {item.member

                                                ? `${item.member.firstName} ${item.member.lastName}`

                                                : members.find(
                                                    m =>
                                                        Number(
                                                            m.memberID
                                                        ) ===
                                                        Number(
                                                            item.memberID
                                                        )
                                                )
                                                    ? `${members.find(
                                                        m =>
                                                            Number(
                                                                m.memberID
                                                            ) ===
                                                            Number(
                                                                item.memberID
                                                            )
                                                    ).firstName} ${members.find(
                                                        m =>
                                                            Number(
                                                                m.memberID
                                                            ) ===
                                                            Number(
                                                                item.memberID
                                                            )
                                                    ).lastName}`

                                                    : "Unknown Member"

                                            }

                                        </td>



                                        {/* PLAN */}

                                        <td>

                                            <strong>

                                                {item.membershipPlan

                                                    ? item.membershipPlan.planName

                                                    : plans.find(
                                                        p =>
                                                            Number(
                                                                p.planID
                                                            ) ===
                                                            Number(
                                                                item.planID
                                                            )
                                                    )?.planName

                                                        || "Unknown Plan"

                                                }

                                            </strong>


                                            {item.membershipPlan?.planName &&

                                                item.membershipPlan.planName !== "Walk-in" &&

                                                item.remainingDays !== undefined &&

                                                item.remainingDays > 0 && (

                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "12px",
                                                            color:
                                                                "#777"
                                                        }}
                                                    >

                                                        {item.remainingDays}
                                                        {" "}
                                                        day(s) left

                                                    </div>

                                                )

                                            }

                                        </td>



                                        {/* START DATE */}

                                        <td>

                                            {formatDate(
                                                item.startDate
                                            )}

                                        </td>



                                        {/* END DATE */}

                                        <td>

                                            {formatDate(
                                                item.endDate
                                            )}

                                        </td>



                                        {/* REMAINING */}

                                        <td>

                                            <span>

                                                {getRemainingText(
                                                    item
                                                )}

                                            </span>

                                        </td>



                                        {/* STATUS */}

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



                                        {/* ACTIONS */}

                                        <td>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    gap:
                                                        "8px",
                                                    alignItems:
                                                        "center"
                                                }}
                                            >


                                                {/* EDIT */}

                                                <button

                                                    type="button"

                                                    className="btn-table-edit"

                                                    title="Edit Membership"

                                                    onClick={() =>
                                                        editMembership(
                                                            item
                                                        )
                                                    }

                                                >

                                                    <FaEdit />

                                                </button>



                                                {/* RENEW */}

                                                {item.membershipPlan &&

                                                    item.membershipPlan.planName !== "Walk-in" &&

                                                    (
                                                        item.status === "Expired" ||
                                                        Number(
                                                            item.remainingDays
                                                        ) <= 7
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

                                                    )

                                                }



                                                {/* DELETE */}

                                                {role === "Admin" && (

                                                    <button

                                                        type="button"

                                                        className="btn-table-delete"

                                                        title="Delete Membership"

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

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>



            {/* =================================================
                EDIT MEMBERSHIP MODAL
            ================================================= */}

            {editingId !== null && (

                <div

                    style={{

                        position:
                            "fixed",

                        inset:
                            0,

                        backgroundColor:
                            "rgba(0,0,0,0.5)",

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        zIndex:
                            1050,

                        padding:
                            "20px"

                    }}

                >


                    <div

                        style={{

                            width:
                                "100%",

                            maxWidth:
                                "550px",

                            maxHeight:
                                "90vh",

                            overflowY:
                                "auto",

                            backgroundColor:
                                "#fff",

                            borderRadius:
                                "20px",

                            boxShadow:
                                "0 20px 50px rgba(0,0,0,0.25)"

                        }}

                    >


                        <div
                            style={{
                                padding:
                                    "30px"
                            }}
                        >


                            {/* MODAL TITLE */}

                            <h4
                                style={{
                                    color:
                                        "#081C45",
                                    marginBottom:
                                        "25px",
                                    fontWeight:
                                        "700"
                                }}
                            >

                                <FaEdit
                                    style={{
                                        marginRight:
                                            "10px"
                                    }}
                                />

                                Edit Membership

                            </h4>



                            <form
                                onSubmit={
                                    updateMembership
                                }
                            >


                                {/* MEMBER */}

                                <div
                                    style={{
                                        marginBottom:
                                            "18px"
                                    }}
                                >

                                    <label
                                        className="form-label"
                                    >

                                        Member

                                    </label>


                                    <select

                                        className="form-select"

                                        name="memberID"

                                        value={
                                            editForm.memberID
                                        }

                                        onChange={
                                            handleEditChange
                                        }

                                        required

                                    >

                                        <option value="">

                                            Select Member

                                        </option>


                                        {members.map(member => (

                                            <option

                                                key={
                                                    member.memberID
                                                }

                                                value={
                                                    member.memberID
                                                }

                                            >

                                                {member.firstName}{" "}
                                                {member.lastName}

                                            </option>

                                        ))}

                                    </select>

                                </div>



                                {/* MEMBERSHIP PLAN */}

                                <div
                                    style={{
                                        marginBottom:
                                            "18px"
                                    }}
                                >

                                    <label
                                        className="form-label"
                                    >

                                        Membership Plan

                                    </label>


                                    <select

                                        className="form-select"

                                        name="planID"

                                        value={
                                            editForm.planID
                                        }

                                        onChange={
                                            handleEditChange
                                        }

                                        required

                                    >

                                        <option value="">

                                            Select Plan

                                        </option>


                                        {plans.map(plan => (

                                            <option

                                                key={
                                                    plan.planID
                                                }

                                                value={
                                                    plan.planID
                                                }

                                            >

                                                {plan.planName}

                                            </option>

                                        ))}

                                    </select>

                                </div>



                                {/* START DATE */}

                                <div
                                    style={{
                                        marginBottom:
                                            "18px"
                                    }}
                                >

                                    <label
                                        className="form-label"
                                    >

                                        Start Date

                                    </label>


                                    <input

                                        type="date"

                                        className="form-control"

                                        name="startDate"

                                        value={
                                            editForm.startDate
                                        }

                                        onChange={
                                            handleEditChange
                                        }

                                    />

                                </div>



                                {/* END DATE */}

                                <div
                                    style={{
                                        marginBottom:
                                            "18px"
                                    }}
                                >

                                    <label
                                        className="form-label"
                                    >

                                        End Date

                                    </label>


                                    <input

                                        type="date"

                                        className="form-control"

                                        name="endDate"

                                        value={
                                            editForm.endDate
                                        }

                                        onChange={
                                            handleEditChange
                                        }

                                    />

                                </div>



                                {/* STATUS */}

                                <div
                                    style={{
                                        marginBottom:
                                            "25px"
                                    }}
                                >

                                    <label
                                        className="form-label"
                                    >

                                        Status

                                    </label>


                                    <select

                                        className="form-select"

                                        name="status"

                                        value={
                                            editForm.status
                                        }

                                        onChange={
                                            handleEditChange
                                        }

                                    >

                                        <option value="Active">

                                            Active

                                        </option>

                                        <option value="Expired">

                                            Expired

                                        </option>

                                    </select>

                                </div>



                                {/* BUTTONS */}

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        gap:
                                            "10px"
                                    }}
                                >

                                    <button

                                        type="submit"

                                        className="btn-add"

                                    >

                                        <FaEdit
                                            style={{
                                                marginRight:
                                                    "8px"
                                            }}
                                        />

                                        Update Membership

                                    </button>



                                    <button

                                        type="button"

                                        className="btn-report"

                                        onClick={
                                            cancelEdit
                                        }

                                    >

                                        Cancel

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