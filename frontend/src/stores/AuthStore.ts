import { makeAutoObservable } from "mobx";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AUTH_API_URL } from "../config/api";


interface JwtPayload {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
    role?: string;
    unique_name?: string; 
    FullName?: string; // Custom claim
    sub?: string; // Subject = User ID
    exp: number;
}

class AuthStore {
    token: string | null = null;
    username: string | null = null;
    fullName: string | null = null; // Store it
    userId: string | null = null;
    role: string | null = null;
    isAuthenticated: boolean = false;

    constructor() {
        makeAutoObservable(this);
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            this.setToken(savedToken);
        }
    }

    /**
     * Decodes a JWT token and updates the store state with user identity and claims.
     * Handles browser refresh persistence via localStorage.
     * @param token - The raw JWT string received from the backend
     */
    setToken(token: string) {
        this.token = token;
        this.isAuthenticated = true;
        localStorage.setItem('token', token);

        try {
            const decoded = jwtDecode<JwtPayload>(token);
            
            // Handle both standard claim types and short names
            this.role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || null;
            this.username = decoded.unique_name || null;
            // Map the FullName claim
            this.fullName = decoded.FullName || null;
            this.userId = decoded.sub || null;
        } catch {
            // Token is malformed or expired - clear auth state
            this.logout();
        }
    }


    // Helper function for error handling
    private getErrorMessage(error: unknown): string {
        if (axios.isAxiosError(error)) {
            // The server usually returns the message in response.data
            // In .NET it can be a string or an object with title
            return error.response?.data?.message || error.response?.data || "Server connection failed";
        }
        return "An unexpected error occurred";
    }

    login = async (username: string, password: string) => {
        try {
            const response = await axios.post(`${AUTH_API_URL}/api/auth/login`, { 
                username, password 
            });
            this.setToken(response.data.token); 
            return { success: true, message: "Welcome back!" };
        } catch {
            // Server rejected credentials - return user-friendly message
            return { success: false, message: "Invalid username or password" }; 
        }
    }

    register = async (username: string, fullName: string, password: string, role: string) => {
        try {
            const response = await axios.post(`${AUTH_API_URL}/api/auth/register`, { 
                username, fullName, password, role 
            });
            
            if (response.data && response.data.token) {
                this.setToken(response.data.token);
            }
            return { success: true, message: "Registration successful" };
        } catch (error) {
            // Server returned validation error (e.g., username taken)
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