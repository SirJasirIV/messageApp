export function logout(navigate) {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/");
}