
import { supabase } from "./lib/supabase"


function App() {
  //test supabase connection(status: good connection)
  async function testConnection() {
    const{data, error} = await supabase.from("student_signUp").select("*")
    console.log("data",data)
    console.log("error",error)
  }

  return (
    <>
    <button onClick={()=>testConnection()} >click</button>
    
    </>
  )
}

export default App
