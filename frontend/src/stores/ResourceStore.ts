import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import { authStore } from "./AuthStore";
import { RESOURCE_API_URL } from "../config/api";

export interface Asset {
    id?: string;
    name: string;
    type: string;
    description: string;
    isAvailable: boolean;
    bookedBy?: string;
    bookedByFullName?: string;
}

export interface DashboardStats {
    totalAssets: number;
    availableAssets: number;
    inUseAssets: number;
}

class ResourceStore {
    assets: Asset[] = [];
    stats: DashboardStats = { totalAssets: 0, availableAssets: 0, inUseAssets: 0 };
    isLoading: boolean = false;
    page=1; 
    pageSize=12;
    totalCount=0;
    totalPages=0;
    filter: 'all' | 'available' | 'inUse' = 'all';

    constructor() {
        makeAutoObservable(this);
    }
    loadAssets = async () => {
        this.isLoading = true;
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            let query = `${RESOURCE_API_URL}/api/Assets?page=${this.page}&pageSize=${this.pageSize}`;
            
            if (this.filter === 'available') {
                query += '&isAvailable=true';
            } else if (this.filter === 'inUse') {
                query += '&isAvailable=false';
            }

            // Load assets (paginated)
            const response = await axios.get(query, { headers });
            const statsResponse = await axios.get(`${RESOURCE_API_URL}/api/Assets/stats`, { headers });
            
            runInAction(() => {
                this.assets = response.data.items;
                this.page = response.data.page;
                this.totalCount = response.data.totalCount;
                this.totalPages = response.data.totalPages;
                this.stats = statsResponse.data;
            });

        } catch {
            // Network error or server unavailable - keep previous state
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    };

    setPage = (newPage: number) => {
        this.page = newPage;
        this.loadAssets();
    };

    setFilter = (newFilter: 'all' | 'available' | 'inUse') => {
        this.filter = newFilter;
        this.page = 1; // Reset to first page when filtering
        this.loadAssets();
    };
    
    addAsset = async (asset: Asset) => {
        try {
            await axios.post(`${RESOURCE_API_URL}/api/Assets`, asset, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            this.loadAssets();
            return true;
        } catch {
            // Server rejected request (likely authorization failure)
            return false;
        }
    }

    updateAsset = async (id: string, updatedAsset: Asset) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${RESOURCE_API_URL}/api/Assets/${id}`, updatedAsset, { headers });
            
            // Reload assets to ensure filters are applied correctly (e.g. moving from In Use to Available)
            this.loadAssets();
            
            this.loadStats();
            return true;
        } catch {
            // Update failed (conflict, network error, or unauthorized)
            return false;
        }
    }

    deleteAsset = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${RESOURCE_API_URL}/api/Assets/${id}`, { headers });
            this.loadAssets();
            return true;
        } catch {
            // Delete failed (asset not found or unauthorized)
            return false;
        }
    }

    loadStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${RESOURCE_API_URL}/api/Assets/stats`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            runInAction(() => {
                this.stats = response.data;
            });
        } catch {
            // Stats unavailable - keep previous values
        }
    }
}

export const resourceStore = new ResourceStore();