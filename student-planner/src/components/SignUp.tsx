import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../css/SignUp.css";

export default function SignUp() {
    const navigate = useNavigate();
    const [studentEmail, setStudentEmail] = useState("")
    const [studentPassword, setStudentPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!studentEmail.includes("@")) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }
        if (studentPassword.length < 6) {
            setErrorMessage("Password must be at least 6 characters.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        const { data, error } = await supabase.auth.signUp({
            email: studentEmail.trim(),
            password: studentPassword,
            options: {
                emailRedirectTo: `${window.location.origin}/login`,
            },
        });

        if (error) {
            setErrorMessage(error.message);
            setIsSubmitting(false);
            return;
        }

        if (!data.session) {
            setSuccessMessage("Registration succeeded. Check your email to confirm your account before logging in.");
            setIsSubmitting(false);
            return;
        }

        navigate("/home");
    }

    return (
        <div className="signup-container">
            <section className="signup-shell">
                <div className="signup-brand-panel">
                    <p className="signup-eyebrow">New Workspace</p>
                    <h1>Set up a planner that keeps your course load under control.</h1>
                    <p className="signup-copy">
                        Create an account to organize assignments, schedule reminder emails, and keep track of work across courses without losing context.
                    </p>
                    <div className="signup-feature-list">
                        <span>Course-based planning</span>
                        <span>Reminder scheduling</span>
                        <span>Progress visibility</span>
                    </div>
                </div>
                <div className="signup-card">
                    <h2>Create account</h2>
                    <p className="signup-caption">Use your school email so reminders go to the inbox you actually monitor.</p>
                    <form className="signup-form" onSubmit={handleSubmit}>
                        <input className="signup-input" type="email" placeholder="Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
                        <input className="signup-input" type="password" placeholder="Password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} />
                        <button className="signup-btn" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Signing Up..." : "Sign Up"}
                        </button>
                    </form>
                    <p className="signup-error">{errorMessage}</p>
                    {successMessage && <p className="signup-success">{successMessage}</p>}
                    <p className="signup-switch">
                        Already have an account? <Link to="/login">Log In</Link>
                    </p>
                </div>
            </section>
        </div>
    )
}
