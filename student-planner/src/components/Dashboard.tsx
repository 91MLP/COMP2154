import { Link } from "react-router-dom";
import { useGetAssignments } from "../query/AssignmentQuery";

function ErrorView({ message }: { message: string }) {
    return <p style={{ color: "red" }}>Error: {message}</p>;
}

export default function Dashboard({ userId }: { userId: string }) {
    const { data, isLoading, error } = useGetAssignments(userId);

    if (isLoading) return "Loading...";
    if (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        return <ErrorView message={msg} />;
    }

    if (!data || data.length === 0) {
        return (
            <div style={{ padding: "2rem" }}>
                <h2>Your Assignments</h2>
                <p>No assignments yet.</p>
                <Link to="/add-assignment">Create your first assignment</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Your Assignments</h2>
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                {data.map((assignment) => (
                    <Link
                        key={assignment.id}
                        to={`/assignment/${assignment.id}`}
                        style={{
                            display: "block",
                            padding: "1rem",
                            borderRadius: "12px",
                            backgroundColor: "#fff",
                            color: "#1a1a2e",
                            textDecoration: "none",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                        }}
                    >
                        <strong>{assignment.assignment_name}</strong>
                        <p style={{ margin: "0.5rem 0 0" }}>{assignment.course_number}</p>
                        <p style={{ margin: "0.35rem 0 0", color: "#666" }}>
                            Due: {assignment.due_date ?? "No due date"}
                        </p>
                        <p style={{ margin: "0.35rem 0 0", color: assignment.completed ? "#1e8449" : "#c0392b" }}>
                            {assignment.completed ? "Complete" : "Incomplete"}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
