import type { AircraftData, Tool, Kit, PurchasePlanItem } from '../types';
import { MASTER_TOOL_INVENTORY } from '../constants';
import { PRELOADED_AIRCRAFT_DATA } from '../preloadedData';
import { PURCHASING_PLAN_DATA } from '../purchasingPlanData';

const LATENCY = 150; // Reduced latency for better UX in a simulated environment

// --- Single-User Data Keys ---
const getKey = (key: string) => `tooling-app-${key}`;

// --- Aircraft Data ---
export const getAircraftData = (): Promise<AircraftData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const key = getKey('aircraftData');
        const savedJSON = window.localStorage.getItem(key);
        if (savedJSON) {
            resolve(JSON.parse(savedJSON));
        } else {
            // First time using the app, seed with preloaded data
            const initialData = PRELOADED_AIRCRAFT_DATA;
            window.localStorage.setItem(key, JSON.stringify(initialData));
            resolve(initialData);
        }
      } catch (error) {
        console.error("Failed to parse aircraft data from localStorage", error);
        resolve(PRELOADED_AIRCRAFT_DATA); // Resolve with default on error
      }
    }, LATENCY);
  });
};

export const saveAircraftData = (aircraftData: AircraftData[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        window.localStorage.setItem(getKey('aircraftData'), JSON.stringify(aircraftData));
        resolve();
      } catch (error) {
        console.error("Failed to save aircraft data to localStorage", error);
        reject(error);
      }
    }, LATENCY);
  });
};

// --- Kits ---
export const getKits = (): Promise<Kit[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const savedKitsJSON = window.localStorage.getItem(getKey('kits'));
                resolve(savedKitsJSON ? JSON.parse(savedKitsJSON) : []);
            } catch (error) {
                console.error("Failed to parse kits from localStorage", error);
                resolve([]);
            }
        }, LATENCY);
    });
};

export const saveKits = (kits: Kit[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                window.localStorage.setItem(getKey('kits'), JSON.stringify(kits));
                resolve();
            } catch (error) {
                console.error("Failed to save kits to localStorage", error);
                reject(error);
            }
        }, LATENCY);
    });
};

// --- Master Inventory ---
export const getMasterInventory = (): Promise<Tool[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const key = getKey('masterInventory');
        const savedInventory = window.localStorage.getItem(key);
        if (savedInventory) {
            resolve(JSON.parse(savedInventory));
        } else {
            // First time using app, seed with preloaded data
            window.localStorage.setItem(key, JSON.stringify(MASTER_TOOL_INVENTORY));
            resolve(MASTER_TOOL_INVENTORY);
        }
      } catch (error) {
        console.error("Failed to parse master inventory from localStorage", error);
        resolve(MASTER_TOOL_INVENTORY);
      }
    }, LATENCY);
  });
};

export const saveMasterInventory = (inventory: Tool[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                window.localStorage.setItem(getKey('masterInventory'), JSON.stringify(inventory));
                resolve();
            } catch (error) {
                console.error("Failed to save master inventory to localStorage", error);
                reject(error);
            }
        }, LATENCY);
    });
};

// --- Purchasing Plan ---
export const getPurchasePlan = (): Promise<PurchasePlanItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
       try {
        const key = getKey('purchasePlan');
        const savedPlan = window.localStorage.getItem(key);
        if (savedPlan) {
            resolve(JSON.parse(savedPlan));
        } else {
            // First time using app, seed with preloaded data
            window.localStorage.setItem(key, JSON.stringify(PURCHASING_PLAN_DATA));
            resolve(PURCHASING_PLAN_DATA);
        }
      } catch (error) {
        console.error("Failed to parse purchase plan from localStorage", error);
        resolve(PURCHASING_PLAN_DATA); 
      }
    }, LATENCY);
  });
};

export const savePurchasePlan = (plan: PurchasePlanItem[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                window.localStorage.setItem(getKey('purchasePlan'), JSON.stringify(plan));
                resolve();
            } catch (error) {
                console.error("Failed to save purchase plan to localStorage", error);
                reject(error);
            }
        }, LATENCY);
    });
};
