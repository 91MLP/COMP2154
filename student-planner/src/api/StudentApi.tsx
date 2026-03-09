import { supabase } from "../lib/supabase";
export  async function GetAssignment(userId:string){
    const {data, error} = await supabase.from("assignment_data_list").select("*").eq("userId",userId).single()
    if(error) throw error
    return data
}