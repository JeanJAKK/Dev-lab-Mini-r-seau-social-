import supabase from "../supabase";

export async function getMessage() {
  const { data, error } = await supabase.from("messages").select("*");

  if (error) {
    console.log("getMessage error : " + error);
    return;
  }
  console.log(Array.isArray(data));
  return data;
}
