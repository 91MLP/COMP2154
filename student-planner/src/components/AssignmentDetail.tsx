import { useState } from "react";
import "../css/AssignmentDetail.css";

type Priority = "Red" | "Yellow" | "Green";

type Assignment = {
    id: string;
    course_number: string;
    assignment_name: string;
    due_date: string;
    priority: Priority;
    comment: string;
    completed: boolean;
};

// Temporary mock data for testing — replace with real Supabase data later
const mockAssignment: Assignment = {
    id: "1",
    course_number: "COMP 2154",
    assignment_name: "Project Proposal",
    due_date: "2026-03-25",
    priority: "Red",
    comment: "Remember to include the system diagram.",
    completed: false,
};

const priorityColors: Record<Priority, string> = {
    Red: "#e74c3c",
    Yellow: "#f1c40f",
    Green: "#2ecc71",
};

export default function AssignmentDetail() {
    const [assignment, setAssignment] = useState<Assignment>(mockAssignment);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(assignment);
    const [deleted, setDeleted] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }

    function handleSaveEdit() {
        setAssignment(editForm);
        setIsEditing(false);
        setSuccessMessage("Assignment updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
    }

    function handleDelete() {
        if (confirm("Are you sure you want to delete this assignment?")) {
            setDeleted(true);
        }
    }

    function handleToggleComplete() {
        setAssignment((prev) => ({ ...prev, completed: !prev.completed }));
        setSuccessMessage(assignment.completed ? "Marked as incomplete." : "Marked as complete! 🎉");
        setTimeout(() => setSuccessMessage(""), 3000);
    }

    function handleSaveComment() {
        setAssignment((prev) => ({ ...prev, comment: editForm.comment }));
        setSuccessMessage("Comment saved!");
        setTimeout(() => setSuccessMessage(""), 3000);
    }

    if (deleted) {
        return (
            <div className="ad-container">
                <div className="ad-card">
                    <p className="ad-deleted">Assignment has been deleted.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ad-container">
            <div className="ad-card">

                {/* Priority Banner */}
                <div
                    className="ad-priority-banner"
                    style={{ backgroundColor: priorityColors[assignment.priority] }}
                >
                    {assignment.priority} Priority
                </div>

                {/* Header */}
                <div className="ad-header">
                    <div>
                        <h2 className="ad-title">{assignment.assignment_name}</h2>
                        <p className="ad-course">{assignment.course_number}</p>
                    </div>
                    <span className={`ad-status ${assignment.completed ? "complete" : "incomplete"}`}>
                        {assignment.completed ? "✅ Complete" : "⏳ Incomplete"}
                    </span>
                </div>

                <p className="ad-due">📅 Due: {assignment.due_date}</p>

                {successMessage && <p className="ad-success">{successMessage}</p>}

                {/* Action Buttons */}
                <div className="ad-actions">
                    <button className="ad-btn edit" onClick={() => { setIsEditing(true); setEditForm(assignment); }}>
                        ✏️ Edit
                    </button>
                    <button className="ad-btn delete" onClick={handleDelete}>
                        🗑️ Delete
                    </button>
                    <button className="ad-btn complete" onClick={handleToggleComplete}>
                        {assignment.completed ? "↩️ Undo Complete" : "✔️ Mark Complete"}
                    </button>
                </div>

                {/* Edit Form */}
                {isEditing && (
                    <div className="ad-edit-form">
                        <h3>Edit Assignment</h3>

                        <label className="ad-label">Course Number</label>
                        <input
                            className="ad-input"
                            name="course_number"
                            value={editForm.course_number}
                            onChange={handleEditChange}
                        />

                        <label className="ad-label">Assignment Name</label>
                        <input
                            className="ad-input"
                            name="assignment_name"
                            value={editForm.assignment_name}
                            onChange={handleEditChange}
                        />

                        <label className="ad-label">Due Date</label>
                        <input
                            className="ad-input"
                            type="date"
                            name="due_date"
                            value={editForm.due_date}
                            onChange={handleEditChange}
                        />

                        <label className="ad-label">Priority</label>
                        <select
                            className="ad-input"
                            name="priority"
                            value={editForm.priority}
                            onChange={handleEditChange}
                        >
                            <option value="Red">🔴 Red</option>
                            <option value="Yellow">🟡 Yellow</option>
                            <option value="Green">🟢 Green</option>
                        </select>

                        <div className="ad-edit-actions">
                            <button className="ad-btn edit" onClick={handleSaveEdit}>💾 Save</button>
                            <button className="ad-btn delete" onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Comment / Notes Section */}
                <div className="ad-comment-section">
                    <h3>📝 Notes / Comments</h3>
                    <textarea
                        className="ad-textarea"
                        name="comment"
                        rows={4}
                        placeholder="Add a note or comment..."
                        value={editForm.comment}
                        onChange={handleEditChange}
                    />
                    <button className="ad-btn edit" onClick={handleSaveComment}>
                        💾 Save Comment
                    </button>
                </div>

            </div>
        </div>
    );
}