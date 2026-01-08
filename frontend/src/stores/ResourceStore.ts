import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "./AuthStore";


export interface Asset {
    id?: string;
    name: string;
    type: string;
    description: string;
    isAvailable: boolean;
}

class ResourceStore {
    assets: Asset[] = [];
    isLoading: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    loadAssets = async () => {
        this.isLoading = true;
        try {
            const response = await axios.get("http://localhost:5002/api/Assets", {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            this.assets = response.data;
        } catch (error) {
            console.error("Failed to load assets:", error);
        } finally {
            this.isLoading = false;
        }
    }

    addAsset = async (asset: Asset) => {
        try {
            const response = await axios.post("http://localhost:5002/api/Assets", asset, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            this.assets.push(response.data);
            return true;
        } catch (error) {
            console.error("Failed to add asset:", error);
            alert("רק מנהלים יכולים להוסיף נכסים!");
            return false;
        }
    }
}

export const resourceStore = new ResourceStore();