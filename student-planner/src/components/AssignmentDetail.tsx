import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteAssignment, updateAssignment } from "../api/StudentApi";
import { queryClient } from "../lib/queryClient";
import { useGetAssignment } from "../query/AssignmentQuery";
import {
    buildReminderTime,
    getReminderDisplayStatus,
    getReminderNoticeMessage,
    getReminderValidationMessage,
    REMINDER_OPTIONS,
} from "../lib/reminders";
import "../css/AssignmentDetail.css";
import type { Priority } from "../types/assignment";

type AssignmentEditForm = {
    course_number: string;
    assignment_name: string;
    due_date: string;
    priority: Priority;
    reminder_enabled: boolean;
    reminder_offset_hours: number | null;
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
    const [noticeMessage, setNoticeMessage] = useState("");

    function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        if (!editForm) return;
        const target = e.target;

        if (target instanceof HTMLInputElement && target.type === "checkbox") {
            setEditForm({ ...editForm, [target.name]: target.checked });
            return;
        }

        if (target.name === "reminder_offset_hours") {
            setEditForm({
                ...editForm,
                reminder_offset_hours: target.value === "" ? null : Number(target.value),
            });
            return;
        }

        setEditForm({ ...editForm, [target.name]: target.value });
    }

    async function handleSaveEdit() {
        if (!editForm || !assignment) return;
        if (editForm.reminder_enabled && !editForm.due_date) {
            setErrorMessage("Please select a due date before enabling reminders.");
            return;
        }

        try {
            const reminderOffsetHours = editForm.reminder_enabled ? editForm.reminder_offset_hours : null;
            const remindAt = editForm.reminder_enabled
                ? buildReminderTime(editForm.due_date, reminderOffsetHours)
                : null;
            const reminderValidationMessage = editForm.reminder_enabled
                ? getReminderValidationMessage(editForm.due_date, reminderOffsetHours)
                : null;

            if (reminderValidationMessage) {
                setErrorMessage(reminderValidationMessage);
                return;
            }

            const reminderNoticeMessage = editForm.reminder_enabled
                ? getReminderNoticeMessage(editForm.due_date, reminderOffsetHours)
                : null;

            await updateAssignment(userId, assignment.id, {
                course_number: editForm.course_number,
                assignment_name: editForm.assignment_name,
                due_date: editForm.due_date,
                priority: editForm.priority,
                reminder_enabled: editForm.reminder_enabled,
                reminder_offset_hours: reminderOffsetHours,
                remind_at: remindAt,
                reminder_sent: false,
                reminder_sent_at: null,
                reminder_error: null,
            });
            await queryClient.invalidateQueries({ queryKey: ["assignments", userId] });
            await queryClient.invalidateQueries({ queryKey: ["assignments", userId, assignment.id] });
            setIsEditing(false);
            setErrorMessage("");
            setNoticeMessage(reminderNoticeMessage ?? "");
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
            const nextCompleted = !assignment.completed;
            await updateAssignment(userId, assignment.id, {
                completed: nextCompleted,
                reminder_enabled: nextCompleted ? false : assignment.reminder_enabled,
                reminder_sent: nextCompleted ? false : assignment.reminder_sent,
                reminder_sent_at: nextCompleted ? null : assignment.reminder_sent_at,
                reminder_error: nextCompleted ? null : assignment.reminder_error,
            });
            await queryClient.invalidateQueries({ queryKey: ["assignments", userId] });
            await queryClient.invalidateQueries({ queryKey: ["assignments", userId, assignment.id] });
            setErrorMessage("");
            setNoticeMessage("");
            setSuccessMessage(
                assignment.completed
                    ? "Marked as incomplete."
                    : "Marked as complete. Reminder disabled.",
            );
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

    const reminderSummary = assignment.completed
        ? "Not needed after completion"
        : assignment.reminder_enabled
            ? `${assignment.reminder_offset_hours ?? "Unknown"} hours before`
            : "Off";
    const reminderStatus = getReminderDisplayStatus({
        completed: assignment.completed,
        reminderEnabled: assignment.reminder_enabled,
        reminderSent: assignment.reminder_sent,
        reminderError: assignment.reminder_error,
        dueDate: assignment.due_date,
        remindAt: assignment.remind_at,
    });

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
                <p className="ad-due">
                    🔔 Reminder: {reminderSummary}
                </p>
                <p className="ad-due" style={{ color: reminderStatus.color }}>📨 Reminder Status: {reminderStatus.text}</p>
                {assignment.reminder_sent_at && (
                    <p className="ad-due">✅ Sent At: {new Date(assignment.reminder_sent_at).toLocaleString()}</p>
                )}
                {assignment.reminder_error && (
                    <p className="ad-deleted">Reminder Error: {assignment.reminder_error}</p>
                )}

                {successMessage && <p className="ad-success">{successMessage}</p>}
                {errorMessage && <p className="ad-deleted">{errorMessage}</p>}
                {noticeMessage && !errorMessage && <p className="ad-due">{noticeMessage}</p>}

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
                                reminder_enabled: assignment.reminder_enabled,
                                reminder_offset_hours: assignment.reminder_offset_hours,
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

                        <label className="ad-label">
                            <input
                                type="checkbox"
                                name="reminder_enabled"
                                checked={editForm.reminder_enabled}
                                onChange={handleEditChange}
                            />
                            {" "}Send email reminder
                        </label>

                        {editForm.reminder_enabled && (
                            <>
                                <label className="ad-label">Reminder Time</label>
                                <select
                                    className="ad-input"
                                    name="reminder_offset_hours"
                                    value={editForm.reminder_offset_hours ?? ""}
                                    onChange={handleEditChange}
                                    disabled={!editForm.due_date}
                                >
                                    {REMINDER_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="ad-due">If the reminder window has already started, the email will be sent on the next scheduled run.</p>
                            </>
                        )}

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
