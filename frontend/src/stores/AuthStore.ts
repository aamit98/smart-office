import { makeAutoObservable } from "mobx";
import axios from "axios";
import { jwtDecode } from "jwt-decode";


interface JwtPayload {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
    role?: string;
    unique_name?: string; 
    exp: number;
}

class AuthStore {
    token: string | null = null;
    username: string | null = null;
    role: string | null = null;
    isAuthenticated: boolean = false;

    constructor() {
        makeAutoObservable(this);
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            this.setToken(savedToken);
        }
    }


    setToken(token: string) {
        this.token = token;
        this.isAuthenticated = true;
        localStorage.setItem('token', token);

        try {
            const decoded = jwtDecode<JwtPayload>(token);
            console.log("Decoded Token:", decoded); // For debugging
            
            // Handle both standard claim types and short names
            this.role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || null;
            this.username = decoded.unique_name || null;
        } catch (e) {
            console.error("Failed to decode token", e);
            this.logout();
        }
    }


    // פונקציית עזר לטיפול בשגיאות
    private getErrorMessage(error: unknown): string {
        if (axios.isAxiosError(error)) {
            // השרת בדרך כלל מחזיר את ההודעה ב-response.data
            // ב-NET. זה יכול להיות string או אובייקט עם title
            return error.response?.data?.message || error.response?.data || "Server connection failed";
        }
        return "An unexpected error occurred";
    }

    login = async (username: string, password: string) => {
        try {
            const response = await axios.post("http://localhost:5001/api/auth/login", { 
                username, password 
            });
            this.setToken(response.data.token); 
            return { success: true, message: "Welcome back!" };
        } catch (error) {
            console.error("Login failed", error);
            // מחזירים את השגיאה הספציפית
            return { success: false, message: "Invalid username or password" }; 
        }
    }

    register = async (username: string, password: string, role: string) => {
        try {
            const response = await axios.post("http://localhost:5001/api/auth/register", { 
                username, password, role 
            });
            
            if (response.data && response.data.token) {
                this.setToken(response.data.token);
            }
            return { success: true, message: "Registration successful" };
        } catch (error) {
            console.error("Registration failed", error);
            // כאן השרת (AuthService) יחזיר אם היוזר קיים
            return { success: false, message: this.getErrorMessage(error) };
        }
    }


    logout = () => {
        this.token = null;
        this.username = null;
        this.role = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
    }
    

    get isAdmin() {
        return this.role?.toLowerCase() === "admin";
    }
}

export const authStore = new AuthStore();