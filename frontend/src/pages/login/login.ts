import loginHtml from "./login.html?raw";
import { login } from "../../services/auth/authService";
import { saveSession } from "../../services/auth/authSession";
import { navigate } from "../../router/router";
import type { LoginRequest } from "../../types/auth";

export function renderLogin(): void {

    const app = document.querySelector<HTMLDivElement>("#app"); 
    if (!app)  
        throw new Error("No se encontró el contenedor principal."); 

    app.innerHTML = loginHtml;

    const form = document.getElementById("form") as HTMLFormElement;
    const inputEmail = document.getElementById("email") as HTMLInputElement;
    const inputPassword = document.getElementById("password") as HTMLInputElement;


    form.addEventListener("submit", async (e: SubmitEvent) => {
        e.preventDefault();
        const credentials: LoginRequest = {
            email: inputEmail.value,
            password: inputPassword.value,
        };

        try {
            const user = await login(credentials);

            if (!user) {
                invalidCredentials();
                return;
            }

            saveSession(user);

            if (user.role === "Admin")
                navigate("/admin/dashboard");
            else 
                navigate("/seller/dashboard");
        
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            invalidCredentials();
        }
    
    });

    function invalidCredentials() {
        alert("Credenciales inválidas. Por favor, intenta nuevamente.");
        inputEmail.value = "";
        inputPassword.value = "";
    }


}