import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAssignment } from "../api/StudentApi";
import "../css/AddAssignment.css";
import type { AssignmentInput, Priority } from "../types/assignment";

const initialForm: AssignmentInput = {
    course_number: "",
    assignment_name: "",
    due_date: "",
    priority: "Yellow",
    comment: "",
};

export default function AddAssignment({ userId }: { userId: string }) {
    const navigate = useNavigate();
    const [form, setForm] = useState<AssignmentInput>(initialForm);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!form.course_number.trim() || !form.assignment_name.trim()) {
            setErrorMessage("Course number and assignment name are required.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const assignment = await createAssignment(userId, {
                ...form,
                course_number: form.course_number.trim(),
                assignment_name: form.assignment_name.trim(),
                priority: form.priority as Priority,
                comment: form.comment.trim(),
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

                    {errorMessage && <p className="aa-error">{errorMessage}</p>}

                    <button className="aa-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Create Assignment"}
                    </button>
                </form>
            </div>
        </div>
    );
}
