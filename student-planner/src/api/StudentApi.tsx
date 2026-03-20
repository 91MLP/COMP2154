import { supabase } from "../lib/supabase";
import type { Assignment, AssignmentInput } from "../types/assignment";

export async function getAssignments(userId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("user_id", userId)
        .order("due_date", { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data ?? [];
}

export async function getAssignment(userId: string, assignmentId: string): Promise<Assignment> {
    const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("user_id", userId)
        .eq("id", assignmentId)
        .single();

    if (error) throw error;
    return data;
}

export async function createAssignment(userId: string, input: AssignmentInput): Promise<Assignment> {
    const { data, error } = await supabase
        .from("assignments")
        .insert({
            user_id: userId,
            course_number: input.course_number,
            assignment_name: input.assignment_name,
            due_date: input.due_date || null,
            priority: input.priority,
            comment: input.comment,
            completed: false,
            reminder_enabled: input.reminder_enabled,
            reminder_offset_hours: input.reminder_offset_hours,
            remind_at: input.remind_at,
            reminder_sent: false,
            reminder_sent_at: null,
            reminder_error: null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateAssignment(
    userId: string,
    assignmentId: string,
    updates: Partial<
        AssignmentInput & {
            completed: boolean;
            reminder_sent: boolean;
            reminder_sent_at: string | null;
            reminder_error: string | null;
        }
    >,
): Promise<Assignment> {
    const payload = {
        ...updates,
        due_date: updates.due_date === "" ? null : updates.due_date,
    };

    const { data, error } = await supabase
        .from("assignments")
        .update(payload)
        .eq("user_id", userId)
        .eq("id", assignmentId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteAssignment(userId: string, assignmentId: string): Promise<void> {
    const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("user_id", userId)
        .eq("id", assignmentId);

    if (error) throw error;
}
