import { useEffect, useState } from "react";
import authService from "../services/auth.service";
import supabase from "../services/supabase";

export function useAuth() {
	const [session, setSession] = useState(null);
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadSession = async () => {
			const currentSession = await authService.getSession();
			setSession(currentSession);
			setUser(currentSession?.user ?? null);
			setLoading(false);
		};

		loadSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession);
			setUser(nextSession?.user ?? null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const login = async (email, password) => authService.signInWithPassword(email, password);
	const loginWithOAuth = async (provider, options) => authService.signInWithOAuth(provider, options);
	const logout = async () => authService.signOut();

	return {
		session,
		user,
		loading,
		isAuthenticated: Boolean(session),
		login,
		loginWithOAuth,
		logout,
	};
}