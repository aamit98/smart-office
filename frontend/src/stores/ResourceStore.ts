import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import { authStore } from "./AuthStore";

const API_URL = "http://localhost:5002";

export interface Asset {
    id?: string;
    name: string;
    type: string;
    description: string;
    isAvailable: boolean;
    bookedBy?: string;
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

            let query = `${API_URL}/api/Assets?page=${this.page}&pageSize=${this.pageSize}`;
            
            if (this.filter === 'available') {
                query += '&isAvailable=true';
            } else if (this.filter === 'inUse') {
                query += '&isAvailable=false';
            }

            // Load assets (paginated)
            const response = await axios.get(query, { headers });
            const statsResponse = await axios.get(`${API_URL}/api/Assets/stats`, { headers });
            
            runInAction(() => {
                this.assets = response.data.items;
                this.page = response.data.page;
                this.totalCount = response.data.totalCount;
                this.totalPages = response.data.totalPages;
                this.stats = statsResponse.data;
            });

        } catch (error) {
            console.error('Failed to load assets:', error);
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
            const response = await axios.post("http://localhost:5002/api/Assets", asset, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            this.loadAssets(); // Refresh list to include new asset
            return true;
        } catch (error) {
            console.error("Failed to add asset:", error);
            alert("Only admins can add assets!");
            return false;
        }
    }

    updateAsset = async (id: string, updatedAsset: Asset) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_URL}/api/Assets/${id}`, updatedAsset, { headers });
            
            // Reload assets to ensure filters are applied correctly (e.g. moving from In Use to Available)
            this.loadAssets();
            
            // Reload stats to reflect changes
            this.loadStats();
            return true;
        } catch (error) {
            console.error("Failed to update asset:", error);
            return false;
        }
    }

    deleteAsset = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/api/Assets/${id}`, { headers });
            this.loadAssets(); // Reload to remove from list
            return true;
        } catch (error) {
            console.error("Failed to delete asset:", error);
            return false;
        }
    }

    // Helper to reload just stats
    loadStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/Assets/stats`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            runInAction(() => {
                this.stats = response.data;
            });
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    }
}

export const resourceStore = new ResourceStore();