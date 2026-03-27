import { useState } from "react";
import { Link } from "react-router-dom";
import ReactCalendar from "react-calendar";
import { useGetAssignments } from "../query/AssignmentQuery";
import type { Assignment } from "../types/assignment";
import "react-calendar/dist/Calendar.css";
import "../css/Calendar.css";

function normalizeDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getPriorityClass(priority: Assignment["priority"]) {
    return `calendar-priority-${priority.toLowerCase()}`;
}

export default function Calendar({ userId }: { userId: string }) {
    const [selectedDate, setSelectedDate] = useState<Date>(normalizeDate(new Date()));
    const { data, isLoading, error } = useGetAssignments(userId);

    if (isLoading) {
        return <div className="calendar-shell">Loading calendar...</div>;
    }

    if (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return <div className="calendar-shell">Error loading calendar: {message}</div>;
    }

    const assignments = data ?? [];
    const assignmentsByDate = assignments.reduce<Record<string, Assignment[]>>((acc, assignment) => {
        if (!assignment.due_date) {
            return acc;
        }

        if (!acc[assignment.due_date]) {
            acc[assignment.due_date] = [];
        }

        acc[assignment.due_date].push(assignment);
        return acc;
    }, {});

    const selectedAssignments = assignmentsByDate[toDateKey(selectedDate)] ?? [];
    const upcomingAssignments = assignments
        .filter((assignment) => assignment.due_date)
        .sort((left, right) => (left.due_date ?? "").localeCompare(right.due_date ?? ""))
        .slice(0, 5);

    return (
        <div className="calendar-shell">
            <section className="calendar-hero">
                <div>
                    <p className="calendar-eyebrow">Planning View</p>
                    <h1 className="calendar-title">See every deadline on one calendar.</h1>
                    <p className="calendar-subtitle">
                        Pick a date to review assignments due that day, then jump straight into the details.
                    </p>
                </div>
                <div className="calendar-summary-card">
                    <span className="calendar-summary-label">Assignments with due dates</span>
                    <strong className="calendar-summary-value">
                        {assignments.filter((assignment) => assignment.due_date).length}
                    </strong>
                </div>
            </section>

            <div className="calendar-layout">
                <section className="calendar-board">
                    <ReactCalendar
                        onChange={(value) => {
                            if (value instanceof Date) {
                                setSelectedDate(normalizeDate(value));
                            }
                        }}
                        value={selectedDate}
                        tileClassName={({ date, view }) => {
                            if (view !== "month") {
                                return null;
                            }

                            const dateAssignments = assignmentsByDate[toDateKey(date)];

                            if (!dateAssignments?.length) {
                                return null;
                            }

                            const hasRedPriority = dateAssignments.some((assignment) => assignment.priority === "Red");
                            const hasYellowPriority = dateAssignments.some((assignment) => assignment.priority === "Yellow");

                            if (hasRedPriority) {
                                return "calendar-tile calendar-tile-red";
                            }

                            if (hasYellowPriority) {
                                return "calendar-tile calendar-tile-yellow";
                            }

                            return "calendar-tile calendar-tile-green";
                        }}
                        tileContent={({ date, view }) => {
                            if (view !== "month") {
                                return null;
                            }

                            const count = assignmentsByDate[toDateKey(date)]?.length ?? 0;

                            if (count === 0) {
                                return null;
                            }

                            return <span className="calendar-tile-count">{count}</span>;
                        }}
                    />
                </section>

                <aside className="calendar-sidebar">
                    <section className="calendar-panel">
                        <p className="calendar-panel-label">Selected date</p>
                        <h2 className="calendar-panel-title">
                            {selectedDate.toLocaleDateString("en-CA", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </h2>

                        {selectedAssignments.length === 0 ? (
                            <p className="calendar-empty-message">No assignments are due on this date.</p>
                        ) : (
                            <div className="calendar-assignment-list">
                                {selectedAssignments.map((assignment) => (
                                    <Link
                                        key={assignment.id}
                                        to={`/assignment/${assignment.id}`}
                                        className="calendar-assignment-card"
                                    >
                                        <div className="calendar-assignment-topline">
                                            <span className={`calendar-priority-pill ${getPriorityClass(assignment.priority)}`}>
                                                {assignment.priority}
                                            </span>
                                            <span className={`calendar-status-pill ${assignment.completed ? "done" : "todo"}`}>
                                                {assignment.completed ? "Complete" : "In progress"}
                                            </span>
                                        </div>
                                        <h3>{assignment.assignment_name}</h3>
                                        <p>{assignment.course_number}</p>
                                        {assignment.comment && (
                                            <span className="calendar-assignment-note">{assignment.comment}</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="calendar-panel">
                        <p className="calendar-panel-label">Coming up</p>
                        <h2 className="calendar-panel-title">Next deadlines</h2>
                        {upcomingAssignments.length === 0 ? (
                            <p className="calendar-empty-message">Add assignments with due dates to populate this list.</p>
                        ) : (
                            <div className="calendar-upcoming-list">
                                {upcomingAssignments.map((assignment) => (
                                    <Link
                                        key={assignment.id}
                                        to={`/assignment/${assignment.id}`}
                                        className="calendar-upcoming-item"
                                    >
                                        <div>
                                            <strong>{assignment.assignment_name}</strong>
                                            <p>{assignment.course_number}</p>
                                        </div>
                                        <span>{assignment.due_date}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </aside>
            </div>
        </div>
    );
}