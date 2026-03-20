export type Priority = "Red" | "Yellow" | "Green";

export type Assignment = {
    id: string;
    user_id: string;
    course_number: string;
    assignment_name: string;
    due_date: string | null;
    priority: Priority;
    comment: string;
    completed: boolean;
    reminder_enabled: boolean;
    reminder_offset_hours: number | null;
    remind_at: string | null;
    reminder_sent: boolean;
    reminder_sent_at: string | null;
    reminder_error: string | null;
    created_at: string;
    updated_at: string;
};

export type AssignmentInput = {
    course_number: string;
    assignment_name: string;
    due_date: string;
    priority: Priority;
    comment: string;
    reminder_enabled: boolean;
    reminder_offset_hours: number | null;
    remind_at: string | null;
};
