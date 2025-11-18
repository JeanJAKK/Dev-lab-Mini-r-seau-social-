// fakeAuth.js

export function fakeLogin(email, password) {
  // ici tu mets un faux utilisateur
  const FAKE_USER = {
    email: "",
    password: "",
  };

  if (email === FAKE_USER.email && password === FAKE_USER.password) {
    // on stocke quelque chose dans le localStorage pour simuler une session
    localStorage.setItem("isLogged", "true");
    return true;
  }
  return false;
}

export function isAuthenticated() {
  return localStorage.getItem("isLogged") === "true";
}

export function logout() {
  localStorage.removeItem("isLogged");
}
