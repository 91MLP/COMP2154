import { useQuery } from "@tanstack/react-query";
import { getAssignment, getAssignments } from "../api/StudentApi";

export function useGetAssignments(userId: string) {
    return useQuery({
        queryKey: ["assignments", userId],
        queryFn: () => getAssignments(userId),
        enabled: !!userId,
    });
}

export function useGetAssignment(userId: string, assignmentId: string) {
    return useQuery({
        queryKey: ["assignments", userId, assignmentId],
        queryFn: () => getAssignment(userId, assignmentId),
        enabled: !!userId && !!assignmentId,
    });
}
