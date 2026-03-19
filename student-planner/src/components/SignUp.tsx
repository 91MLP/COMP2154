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
            <div className="signup-card">
                <h2>Sign Up</h2>
                <form className="signup-form" onSubmit={handleSubmit}>
                    <input className="signup-input" type="email" placeholder="Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
                    <input className="signup-input" type="password" placeholder="Password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} />
                    <button className="signup-btn" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>
                <p className="signup-error">{errorMessage}</p>
                <p>{successMessage}</p>
                <p className="signup-switch">
                    Already have an account? <Link to="/login">Log In</Link>
                </p>
            </div>
        </div>
    )
}
