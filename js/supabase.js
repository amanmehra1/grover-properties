const SUPABASE_URL = "https://wrycqooprlucuarakqtg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_0otv0tcajnhBfUofsCutcw_ndwOlCxD";

const { createClient } = window.supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

window.supabaseClient = supabaseClient;

window.GROVER_PROPERTIES = {
    businessName: "Grover Properties",
    dealerName: "Mukesh Grover",
    phone: "+919068012912",
    whatsapp: "919068012912",
    email: "m.d.mukeshgrover@gmail.com",

    address:
        "Gali No-12, Vasant Vihar, Shop No. 34, Kailash Tikri Road, Near Parveen Hospital, Karnal, Haryana",

    city: "Karnal",
    state: "Haryana"
};