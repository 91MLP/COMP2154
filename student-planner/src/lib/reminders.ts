export const REMINDER_OPTIONS = [
    { label: "24 hours before", value: 24 },
    { label: "48 hours before", value: 48 },
    { label: "72 hours before", value: 72 },
] as const;

export function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

type ReminderStatusInput = {
    completed: boolean;
    reminderEnabled: boolean;
    reminderSent: boolean;
    reminderError: string | null;
    dueDate: string | null;
    remindAt: string | null;
};

export function getReminderDisplayStatus(input: ReminderStatusInput) {
    if (input.completed) {
        return { text: "Reminder not needed", color: "#666" };
    }

    if (!input.reminderEnabled) {
        return { text: "Reminder off", color: "#666" };
    }

    if (input.reminderSent) {
        return { text: "Reminder sent", color: "#1e8449" };
    }

    if (input.reminderError) {
        return { text: "Reminder failed", color: "#c0392b" };
    }

    const today = getLocalDateString(new Date());
    if (input.dueDate && input.dueDate < today) {
        return { text: "Reminder expired", color: "#7f8c8d" };
    }

    if (input.remindAt && new Date(input.remindAt).getTime() > Date.now()) {
        return { text: "Reminder scheduled", color: "#2980b9" };
    }

    return { text: "Reminder pending", color: "#b9770e" };
}

export function buildReminderTime(dueDate: string, offsetHours: number | null): string | null {
    if (!dueDate || offsetHours === null) {
        return null;
    }

    const dueAt = new Date(`${dueDate}T09:00:00`);
    dueAt.setHours(dueAt.getHours() - offsetHours);

    return dueAt.toISOString();
}

export function getReminderValidationMessage(dueDate: string, offsetHours: number | null): string | null {
    if (!dueDate) {
        return null;
    }

    const today = getLocalDateString(new Date());
    if (dueDate < today) {
        return "This due date has already passed. Choose today or a future date for reminders.";
    }

    const remindAt = buildReminderTime(dueDate, offsetHours);

    if (!remindAt) {
        return null;
    }

    return null;
}

export function getReminderNoticeMessage(dueDate: string, offsetHours: number | null): string | null {
    const remindAt = buildReminderTime(dueDate, offsetHours);

    if (!remindAt) {
        return null;
    }

    if (new Date(remindAt).getTime() <= Date.now()) {
        return "This reminder window has already started. The reminder will be sent on the next scheduled run.";
    }

    return null;
}
