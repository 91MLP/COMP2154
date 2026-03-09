import { useQuery } from "@tanstack/react-query";
import { GetAssignment } from "../api/StudentApi";

export function useGetAssignment(userId:string){
    return useQuery({
        queryKey:["assignment_data_list",userId],
        queryFn:()=>GetAssignment(userId),
        enabled:!!userId
    })

}