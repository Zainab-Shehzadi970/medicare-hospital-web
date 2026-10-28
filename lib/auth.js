import { supabase } from "./supabase";

// Where a signed-in user belongs: doctors go to the doctor console, everyone else to the patient dashboard
export async function getHomeRoute(userId) {
  const { data } = await supabase
    .from("doctors")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();
  return data ? "/doctor-appointments" : "/patient-dashboard";
}