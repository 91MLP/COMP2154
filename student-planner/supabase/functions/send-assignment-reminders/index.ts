import "../edge-runtime.d.ts";
import "../esm-sh.d.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL")!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const reminderTimeZone = "America/Toronto";

function getDateInTimeZone(date: Date, timeZone: string): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

Deno.serve(async () => {
    try {
        const now = new Date();
        const today = getDateInTimeZone(now, reminderTimeZone);

        const { data: assignments, error } = await supabase
            .from("assignments")
            .select(`
                id,
                user_id,
                course_number,
                assignment_name,
                due_date,
                comment,
                remind_at,
                reminder_enabled,
                reminder_sent,
                completed
            `)
            .eq("reminder_enabled", true)
            .eq("reminder_sent", false)
            .eq("completed", false)
            .not("remind_at", "is", null)
            .not("due_date", "is", null)
            .lte("remind_at", now.toISOString())
            .gte("due_date", today);

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (!assignments || assignments.length === 0) {
            return new Response(JSON.stringify({ message: "No reminders to send." }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        for (const assignment of assignments) {
            const { data: userData, error: userError } =
                await supabase.auth.admin.getUserById(assignment.user_id);

            if (userError || !userData.user?.email) {
                await supabase
                    .from("assignments")
                    .update({
                        reminder_error: userError?.message ?? "User email not found",
                    })
                    .eq("id", assignment.id);

                continue;
            }

            const resendResponse = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: userData.user.email,
                    subject: `Assignment Reminder: ${assignment.assignment_name}`,
                    html: `
                        <h2>Assignment Reminder</h2>
                        <p>Hello Student,</p>
                        <p>This is a reminder for your assignment.</p>
                        <ul>
                            <li><strong>Course:</strong> ${assignment.course_number}</li>
                            <li><strong>Assignment:</strong> ${assignment.assignment_name}</li>
                            <li><strong>Due Date:</strong> ${assignment.due_date ?? "No due date"}</li>
                            <li><strong>Comment:</strong> ${assignment.comment || "None"}</li>
                        </ul>
                        <p>Please make sure to complete it on time.</p>
                    `,
                }),
            });

            if (!resendResponse.ok) {
                const resendErrorText = await resendResponse.text();

                await supabase
                    .from("assignments")
                    .update({
                        reminder_error: resendErrorText,
                    })
                    .eq("id", assignment.id);

                continue;
            }

            await supabase
                .from("assignments")
                .update({
                    reminder_sent: true,
                    reminder_sent_at: now.toISOString(),
                    reminder_error: null,
                })
                .eq("id", assignment.id);
        }

        return new Response(JSON.stringify({ message: "Reminder job completed." }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
