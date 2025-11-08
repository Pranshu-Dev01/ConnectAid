import { useState, useEffect, useCallback } from 'react';
import { User, Alert } from '../types';

const USER_DB_KEY = 'connect_aid_user_db_v3';
const SESSION_KEY = 'connect_aid_session_v3'; // Stores the contact of the logged-in user

const getDb = (): User[] => {
    try {
        const db = localStorage.getItem(USER_DB_KEY);
        return db ? JSON.parse(db) : [];
    } catch (error) {
        console.error("Failed to parse user DB from localStorage", error);
        return [];
    }
};

const saveDb = (db: User[]) => {
    try {
        localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
    } catch (error) {
        console.error("Failed to save user DB to localStorage", error);
    }
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        try {
            const sessionContact = localStorage.getItem(SESSION_KEY);
            if (sessionContact) {
                const db = getDb();
                const loggedInUser = db.find(u => u.contact === sessionContact);
                if (loggedInUser) {
                     if (loggedInUser.alerts) {
                        loggedInUser.alerts = loggedInUser.alerts.map((a: Alert) => ({...a, timestamp: new Date(a.timestamp)}));
                    }
                    setUser(loggedInUser);
                }
            }
        } catch (error) {
            console.error("Failed to initialize session", error);
        }
    }, []);

    const register = useCallback(async (userData: Omit<User, 'alerts'>): Promise<{ success: boolean; message: string }> => {
        const db = getDb();
        if (db.some(u => u.contact === userData.contact)) {
            return { success: false, message: "An account with this contact already exists." };
        }
        const newUser: User = { ...userData, alerts: [] };
        db.push(newUser);
        saveDb(db);
        localStorage.setItem(SESSION_KEY, newUser.contact);
        setUser(newUser);
        return { success: true, message: "Registration successful!" };
    }, []);

    const login = useCallback(async (contact: string, password?: string): Promise<{ success: boolean; message: string }> => {
        const db = getDb();
        const foundUser = db.find(u => u.contact === contact);

        if (!foundUser) {
            return { success: false, message: "No account found with this contact." };
        }
        // For email, check password. For phone/OTP, we assume OTP was validated before calling this.
        if (foundUser.loginMethod === 'email' && foundUser.password !== password) {
            return { success: false, message: "Invalid password." };
        }
        
        localStorage.setItem(SESSION_KEY, foundUser.contact);
        if (foundUser.alerts) {
            foundUser.alerts = foundUser.alerts.map((a: Alert) => ({...a, timestamp: new Date(a.timestamp)}));
        }
        setUser(foundUser);
        return { success: true, message: "Login successful!" };
    }, []);
    
    const loginWithGoogle = useCallback((googleUser: {name: string, contact: string}) => {
        const db = getDb();
        let userInDb = db.find(u => u.contact === googleUser.contact && u.loginMethod === 'google');
        if (!userInDb) {
            // If user doesn't exist, create one (auto-registration for Google)
            userInDb = { ...googleUser, loginMethod: 'google', alerts: [] };
            db.push(userInDb);
            saveDb(db);
        }
        localStorage.setItem(SESSION_KEY, userInDb.contact);
        setUser(userInDb);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
    }, []);
    
    const addAlertToHistory = useCallback((alert: Alert) => {
        const db = getDb();
        const userIndex = db.findIndex(u => u.contact === user?.contact);

        if (userIndex > -1) {
            const updatedUser = {
                ...db[userIndex],
                alerts: [alert, ...db[userIndex].alerts],
            };
            db[userIndex] = updatedUser;
            saveDb(db);
            setUser(updatedUser);
        }
    }, [user]);

    return { user, register, login, loginWithGoogle, logout, addAlertToHistory };
};