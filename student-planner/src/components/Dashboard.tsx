import { Link } from "react-router-dom";
import { useGetAssignments } from "../query/AssignmentQuery";
import { getReminderDisplayStatus } from "../lib/reminders";
import "../css/Dashboard.css";

function ErrorView({ message }: { message: string }) {
    return <p className="dashboard-error">Error: {message}</p>;
}

export default function Dashboard({ userId }: { userId: string }) {
    const { data, isLoading, error } = useGetAssignments(userId);

    if (isLoading) return <div className="dashboard-shell">Loading...</div>;
    if (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return <div className="dashboard-shell"><ErrorView message={msg} /></div>;
    }

    const assignments = data ?? [];
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter((assignment) => assignment.completed).length;
    const pendingAssignments = totalAssignments - completedAssignments;
    const reminderActiveAssignments = assignments.filter(
        (assignment) => assignment.reminder_enabled && !assignment.completed,
    ).length;
    const nextDueAssignment = assignments.find(
        (assignment) => !assignment.completed && assignment.due_date,
    );

    if (totalAssignments === 0) {
        return (
            <div className="dashboard-shell">
                <section className="dashboard-hero">
                    <div>
                        <p className="dashboard-eyebrow">Planner Overview</p>
                        <h1 className="dashboard-title">Build momentum before deadlines build pressure.</h1>
                        <p className="dashboard-subtitle">
                            Start by adding your first assignment. The planner will track priority, due dates, and reminder delivery in one place.
                        </p>
                    </div>
                    <Link className="dashboard-primary-action" to="/add-assignment">Create your first assignment</Link>
                </section>

                <section className="dashboard-empty-state">
                    <div className="dashboard-empty-icon">+</div>
                    <h2>No assignments yet</h2>
                    <p>Your dashboard will fill with upcoming work, progress, and reminders as soon as you add one.</p>
                </section>
            </div>
        );
    }

    return (
        <div className="dashboard-shell">
            <section className="dashboard-hero">
                <div>
                    <p className="dashboard-eyebrow">Planner Overview</p>
                    <h1 className="dashboard-title">Your academic week at a glance.</h1>
                    <p className="dashboard-subtitle">
                        Review upcoming assignments, monitor reminder delivery, and keep high-priority work visible before it becomes urgent.
                    </p>
                </div>
                <div className="dashboard-hero-side">
                    <div className="dashboard-next-due-label">Next focus</div>
                    <div className="dashboard-next-due-title">
                        {nextDueAssignment?.assignment_name ?? "All caught up"}
                    </div>
                    <div className="dashboard-next-due-meta">
                        {nextDueAssignment?.due_date
                            ? `Due ${nextDueAssignment.due_date}`
                            : "No active due dates"}
                    </div>
                    <Link className="dashboard-primary-action" to="/add-assignment">Add Assignment</Link>
                </div>
            </section>

            <section className="dashboard-stats">
                <article className="dashboard-stat-card">
                    <span className="dashboard-stat-label">Total assignments</span>
                    <strong className="dashboard-stat-value">{totalAssignments}</strong>
                </article>
                <article className="dashboard-stat-card">
                    <span className="dashboard-stat-label">Pending work</span>
                    <strong className="dashboard-stat-value">{pendingAssignments}</strong>
                </article>
                <article className="dashboard-stat-card">
                    <span className="dashboard-stat-label">Completed</span>
                    <strong className="dashboard-stat-value">{completedAssignments}</strong>
                </article>
                <article className="dashboard-stat-card">
                    <span className="dashboard-stat-label">Active reminders</span>
                    <strong className="dashboard-stat-value">{reminderActiveAssignments}</strong>
                </article>
            </section>

            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <div>
                        <p className="dashboard-section-label">Assignment Board</p>
                        <h2 className="dashboard-section-title">Track what needs attention next.</h2>
                    </div>
                </div>
                <div className="dashboard-grid">
                    {assignments.map((assignment) => {
                        const reminderStatus = getReminderDisplayStatus({
                            completed: assignment.completed,
                            reminderEnabled: assignment.reminder_enabled,
                            reminderSent: assignment.reminder_sent,
                            reminderError: assignment.reminder_error,
                            dueDate: assignment.due_date,
                            remindAt: assignment.remind_at,
                        });

                        return (
                            <Link
                                key={assignment.id}
                                to={`/assignment/${assignment.id}`}
                                className="dashboard-assignment-card"
                            >
                                <div className="dashboard-card-topline">
                                    <span className={`dashboard-priority-pill priority-${assignment.priority.toLowerCase()}`}>
                                        {assignment.priority} priority
                                    </span>
                                    <span className={`dashboard-complete-pill ${assignment.completed ? "done" : "todo"}`}>
                                        {assignment.completed ? "Complete" : "In progress"}
                                    </span>
                                </div>
                                <h3 className="dashboard-card-title">{assignment.assignment_name}</h3>
                                <p className="dashboard-card-course">{assignment.course_number}</p>
                                <div className="dashboard-card-meta">
                                    <span>Due</span>
                                    <strong>{assignment.due_date ?? "No due date"}</strong>
                                </div>
                                <div className="dashboard-card-meta">
                                    <span>Reminder</span>
                                    <strong style={{ color: reminderStatus.color }}>{reminderStatus.text}</strong>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
