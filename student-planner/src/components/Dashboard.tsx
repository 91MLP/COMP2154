import { useGetAssignment } from "../query/AssignmentQuery";

function ErrorView({message}:{message:string}){
    return <p style={{color:"red"}} >Error:{message}</p>
}


export default function Dashboard({userId}:{userId:string}){
    const{data, isLoading,error} = useGetAssignment(userId)
    if (isLoading) return "Loading...";
    if (error) {const msg = error instanceof Error ? error.message : "Unknown error";
    return <ErrorView message={msg} />;}
    if (!data) return <p>No data.</p>;

    return(
        <>
        <p>{data.Course_number}</p>
        <p>{data.Assignment_name}</p>
        
        </>
    )
}