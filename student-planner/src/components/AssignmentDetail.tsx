import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteAssignment, updateAssignment } from "../api/StudentApi";
import { queryClient } from "../lib/queryClient";
import { useGetAssignment } from "../query/AssignmentQuery";
import "../css/AssignmentDetail.css";
import type { Priority } from "../types/assignment";

type AssignmentEditForm = {
    course_number: string;
    assignment_name: string;
    due_date: string;
    priority: Priority;
};

const priorityColors: Record<Priority, string> = {
    Red: "#e74c3c",
    Yellow: "#f1c40f",
    Green: "#2ecc71",
};

export default function AssignmentDetail({ userId }: { userId: string }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data: assignment, isLoading, error } = useGetAssignment(userId, id ?? "");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<AssignmentEditForm | null>(null);
    const [commentDraft, setCommentDraft] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        if (!editForm) return;
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }

    async function handleSaveEdit() {
        if (!editForm || !assignment) return;

        try {
            await updateAssignment(userId, assignment.id, {
                course_number: editForm.course_number,
                assignment_name: editForm.assignment_name,
                due_date: editForm.due_date,
                priority: editForm.priority,
            });
            await queryClient.invalidateQueries({ queryKey: ["assignments", userId] });
            await queryClient.invalidateQueries({ queryKey: ["assignments", userId, assignment.id] });
            setIsEditing(false);
            setErrorMessage("");
            setSuccessMessage("Assignment updated successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update assignment.";
            setErrorMessage(message);
        }
    }

    async function handleDelete() {
        if (!assignment) return;
        if (confirm("Are you sure you want to delete this assignment?")) {
            try {
                await deleteAssignment(userId, assignment.id);
                await queryClient.invalidateQueries({ queryKey: ["assignments", userId] });
                navigate("/home");
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to delete assignment.";
                setErrorMessage(message);
            }
        }
    }

    async function handleToggleComplete() {
        if (!assignment) return;

        try {
            await updateAssignment(userId, assignment.id, {
                completed: !assignment.completed,
            });
            await queryClient.invalidateQueries({ queryKey: ["assignments", userId] });
            await queryClient.invalidateQueries({ queryKey: ["assignments", userId, assignment.id] });
            setErrorMessage("");
            setSuccessMessage(assignment.completed ? "Marked as incomplete." : "Marked as complete!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update status.";
            setErrorMessage(message);
        }
    }

    async function handleSaveComment() {
        if (!assignment) return;

        try {
            await updateAssignment(userId, assignment.id, {
                comment: commentDraft ?? assignment.comment,
            });
            await queryClient.invalidateQueries({ queryKey: ["assignments", userId] });
            await queryClient.invalidateQueries({ queryKey: ["assignments", userId, assignment.id] });
            setErrorMessage("");
            setSuccessMessage("Comment saved!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save comment.";
            setErrorMessage(message);
        }
    }

    if (isLoading) {
        return <div className="ad-container"><div className="ad-card"><p className="ad-deleted">Loading assignment...</p></div></div>;
    }

    if (error || !assignment) {
        const message = error instanceof Error ? error.message : "Assignment not found.";
        return <div className="ad-container"><div className="ad-card"><p className="ad-deleted">{message}</p></div></div>;
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
                {errorMessage && <p className="ad-deleted">{errorMessage}</p>}

                {/* Action Buttons */}
                <div className="ad-actions">
                    <button
                        className="ad-btn edit"
                        onClick={() => {
                            setIsEditing(true);
                            setEditForm({
                                course_number: assignment.course_number,
                                assignment_name: assignment.assignment_name,
                                due_date: assignment.due_date ?? "",
                                priority: assignment.priority,
                            });
                        }}
                    >
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
                {isEditing && editForm && (
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
                            value={editForm.due_date ?? ""}
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
                            <button className="ad-btn delete" type="button" onClick={() => setIsEditing(false)}>Cancel</button>
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
                            value={commentDraft ?? assignment.comment}
                            onChange={(e) => setCommentDraft(e.target.value)}
                        />
                    <button className="ad-btn edit" onClick={handleSaveComment}>
                        💾 Save Comment
                    </button>
                </div>

            </div>
        </div>
    );
}
