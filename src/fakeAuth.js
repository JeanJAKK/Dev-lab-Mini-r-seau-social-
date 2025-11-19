export function fakeLogin(email, password) {
  const FAKE_USER = {
    email: "",
    password: "",
  };

  if (email === FAKE_USER.email && password === FAKE_USER.password) {
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
