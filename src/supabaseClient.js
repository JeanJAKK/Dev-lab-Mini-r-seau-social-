// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://msstkhwzrlknytgqxvin.supabase.co";      // défini dans .env
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zc3RraHd6cmxrbnl0Z3F4dmluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzE4NDUsImV4cCI6MjA3ODIwNzg0NX0.oDZJpMiIZ_yY7XzqysxraJqS4guywr_yn5O3MthKddk; "

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
