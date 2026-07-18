import supabase from "./supabase";

export const authService = {
	async getSession() {
		const { data, error } = await supabase.auth.getSession();
		if (error) throw error;
		return data.session ?? null;
	},

	async getUser() {
		const { data, error } = await supabase.auth.getUser();
		if (error) throw error;
		return data.user ?? null;
	},

	async signInWithPassword(email, password) {
		return supabase.auth.signInWithPassword({ email, password });
	},

	async signInWithOAuth(provider, options = {}) {
		return supabase.auth.signInWithOAuth({ provider, options });
	},

	async signOut() {
		return supabase.auth.signOut();
	},
};

export default authService;