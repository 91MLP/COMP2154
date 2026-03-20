import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAssignment } from "../api/StudentApi";
import {
    buildReminderTime,
    getReminderNoticeMessage,
    getReminderValidationMessage,
    REMINDER_OPTIONS,
} from "../lib/reminders";
import "../css/AddAssignment.css";
import type { AssignmentInput } from "../types/assignment";

const initialForm: AssignmentInput = {
    course_number: "",
    assignment_name: "",
    due_date: "",
    priority: "Yellow",
    comment: "",
    reminder_enabled: false,
    reminder_offset_hours: 24,
    remind_at: null,
};

export default function AddAssignment({ userId }: { userId: string }) {
    const navigate = useNavigate();
    const [form, setForm] = useState<AssignmentInput>(initialForm);
    const [errorMessage, setErrorMessage] = useState("");
    const [noticeMessage, setNoticeMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) {
        const target = e.target;
        const { name, value } = target;

        setForm((prev) => {
            if (target instanceof HTMLInputElement && target.type === "checkbox") {
                return { ...prev, [name]: target.checked };
            }

            if (name === "reminder_offset_hours") {
                return {
                    ...prev,
                    reminder_offset_hours: value === "" ? null : Number(value),
                };
            }

            return { ...prev, [name]: value };
        });
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!form.course_number.trim() || !form.assignment_name.trim()) {
            setErrorMessage("Course number and assignment name are required.");
            return;
        }
        if (form.reminder_enabled && !form.due_date) {
            setErrorMessage("Please select a due date before enabling reminders.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");
        setNoticeMessage("");

        try {
            const reminderOffsetHours = form.reminder_enabled ? form.reminder_offset_hours : null;
            const remindAt = form.reminder_enabled
                ? buildReminderTime(form.due_date, reminderOffsetHours)
                : null;
            const reminderValidationMessage = form.reminder_enabled
                ? getReminderValidationMessage(form.due_date, reminderOffsetHours)
                : null;

            if (reminderValidationMessage) {
                setErrorMessage(reminderValidationMessage);
                setIsSubmitting(false);
                return;
            }

            const reminderNoticeMessage = form.reminder_enabled
                ? getReminderNoticeMessage(form.due_date, reminderOffsetHours)
                : null;
            if (reminderNoticeMessage) {
                setNoticeMessage(reminderNoticeMessage);
            }

            const assignment = await createAssignment(userId, {
                ...form,
                course_number: form.course_number.trim(),
                assignment_name: form.assignment_name.trim(),
                comment: form.comment.trim(),
                reminder_offset_hours: reminderOffsetHours,
                remind_at: remindAt,
            });

            navigate(`/assignment/${assignment.id}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create assignment.";
            setErrorMessage(message);
            setIsSubmitting(false);
        }
    }

    return (
        <div className="aa-container">
            <div className="aa-card">
                <h2>Add Assignment</h2>
                <form className="aa-form" onSubmit={handleSubmit}>
                    <label className="aa-label">Course Number</label>
                    <input
                        className="aa-input"
                        name="course_number"
                        value={form.course_number}
                        onChange={handleChange}
                        placeholder="COMP 2154"
                    />

                    <label className="aa-label">Assignment Name</label>
                    <input
                        className="aa-input"
                        name="assignment_name"
                        value={form.assignment_name}
                        onChange={handleChange}
                        placeholder="Project Proposal"
                    />

                    <label className="aa-label">Due Date</label>
                    <input
                        className="aa-input"
                        type="date"
                        name="due_date"
                        value={form.due_date}
                        onChange={handleChange}
                    />

                    <label className="aa-label">Priority</label>
                    <select
                        className="aa-input"
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                    >
                        <option value="Red">Red</option>
                        <option value="Yellow">Yellow</option>
                        <option value="Green">Green</option>
                    </select>

                    <label className="aa-label">Comment</label>
                    <textarea
                        className="aa-textarea"
                        name="comment"
                        value={form.comment}
                        onChange={handleChange}
                        placeholder="Optional notes"
                        rows={4}
                    />

                    <label className="aa-label">
                        <input
                            type="checkbox"
                            name="reminder_enabled"
                            checked={form.reminder_enabled}
                            onChange={handleChange}
                        />
                        {" "}Send email reminder
                    </label>

                    {form.reminder_enabled && (
                        <>
                            <label className="aa-label">Reminder Time</label>
                            <select
                                className="aa-input"
                                name="reminder_offset_hours"
                                value={form.reminder_offset_hours ?? ""}
                                onChange={handleChange}
                                disabled={!form.due_date}
                            >
                                {REMINDER_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="aa-label" style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                                If the reminder window has already started, the email will be sent on the next scheduled run.
                            </p>
                        </>
                    )}

                    {errorMessage && <p className="aa-error">{errorMessage}</p>}
                    {noticeMessage && !errorMessage && <p className="aa-label">{noticeMessage}</p>}

                    <button className="aa-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Create Assignment"}
                    </button>
                </form>
            </div>
        </div>
    );
}
