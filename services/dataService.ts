import type { AircraftData, Tool, Kit, PurchasePlanItem } from '../types';
import { MASTER_TOOL_INVENTORY } from '../constants';
import { PRELOADED_AIRCRAFT_DATA } from '../preloadedData';
import { PURCHASING_PLAN_DATA } from '../purchasingPlanData';

const LATENCY = 150; // Reduced latency for better UX in a simulated environment

// --- Multi-User Data Keys ---
const getKey = (key: string, user: string) => `tooling-app-${user}-${key}`;

// --- Aircraft Data ---
export const getAircraftData = (user: string): Promise<AircraftData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const key = getKey('aircraftData', user);
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

export const saveAircraftData = (aircraftData: AircraftData[], user: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        window.localStorage.setItem(getKey('aircraftData', user), JSON.stringify(aircraftData));
        resolve();
      } catch (error) {
        console.error("Failed to save aircraft data to localStorage", error);
        reject(error);
      }
    }, LATENCY);
  });
};

// --- Kits ---
export const getKits = (user: string): Promise<Kit[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const savedKitsJSON = window.localStorage.getItem(getKey('kits', user));
                resolve(savedKitsJSON ? JSON.parse(savedKitsJSON) : []);
            } catch (error) {
                console.error("Failed to parse kits from localStorage", error);
                resolve([]);
            }
        }, LATENCY);
    });
};

export const saveKits = (kits: Kit[], user: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                window.localStorage.setItem(getKey('kits', user), JSON.stringify(kits));
                resolve();
            } catch (error) {
                console.error("Failed to save kits to localStorage", error);
                reject(error);
            }
        }, LATENCY);
    });
};

// --- Master Inventory ---
export const getMasterInventory = (user: string): Promise<Tool[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const key = getKey('masterInventory', user);
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

export const saveMasterInventory = (inventory: Tool[], user: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                window.localStorage.setItem(getKey('masterInventory', user), JSON.stringify(inventory));
                resolve();
            } catch (error) {
                console.error("Failed to save master inventory to localStorage", error);
                reject(error);
            }
        }, LATENCY);
    });
};

// --- Purchasing Plan ---
export const getPurchasePlan = (user: string): Promise<PurchasePlanItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
       try {
        const key = getKey('purchasePlan', user);
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

export const savePurchasePlan = (plan: PurchasePlanItem[], user: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                window.localStorage.setItem(getKey('purchasePlan', user), JSON.stringify(plan));
                resolve();
            } catch (error) {
                console.error("Failed to save purchase plan to localStorage", error);
                reject(error);
            }
        }, LATENCY);
    });
};
