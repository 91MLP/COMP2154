import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "../css/ProfileSetting.css";

export default function ProfileSetting() {
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        getProfile();
    }, []);

    async function getProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || "");
                // Assuming you have a 'profiles' table as per Supabase best practices
                const { data, error } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .maybeSingle();

                if (error) throw error;
                if (data) setFullName(data.full_name);
            }
        } catch (error) {
            console.error("Error loading user data", error);
            setMessage("Error loading profile");
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile(e: React.FormEvent) {
        e.preventDefault();
        setMessage("");
        
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('profiles').upsert({
            id: user?.id,
            full_name: fullName,
            updated_at: new Date(),
        });

        if (error) setMessage("Error updating profile");
        else setMessage("Profile updated successfully!");
    }

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <p className="profile-eyebrow">Account Settings</p>
                <h2>Keep your profile ready for reminder delivery.</h2>
                <p className="profile-copy">
                    Your account email stays read-only here, while your display name helps personalize the planner experience.
                </p>
                <form onSubmit={updateProfile} className="profile-form">
                    <div className="form-group">
                        <label>Email (Read-only)</label>
                        <input type="text" value={email} disabled className="profile-input disabled" />
                    </div>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            value={fullName} 
                            onChange={(e) => setFullName(e.target.value)} 
                            className="profile-input"
                            placeholder="Enter your name"
                        />
                    </div>
                    <button type="submit" className="save-btn">Save Changes</button>
                </form>
                {message && <p className={`profile-msg ${message.includes("Error") ? "error" : "success"}`}>{message}</p>}
            </div>
        </div>
    );
}
