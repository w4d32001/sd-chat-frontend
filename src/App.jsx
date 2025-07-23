import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import ContactsPage from "./pages/ContactsPage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useSingleTabChat } from "./store/useSingleTabChat";

const App = () => {
    const { isActive, reason, forceActivate } = useSingleTabChat(true);
    const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
    const { theme } = useThemeStore();

    console.log({ onlineUsers });

    useEffect(() => {
        if (isActive) {
            checkAuth();
        }
    }, [isActive, checkAuth]);

    console.log({ authUser });

    if (!isActive) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-xl text-center p-4 space-y-4">
                {reason === "blocked" && (
                    <>
                        <p className="text-gray-600">
                            Tu sesión ya está activa en otra pestaña. Ciérrala para
                            continuar aquí.
                        </p>
                        <button
                            onClick={forceActivate}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Usar esta pestaña
                        </button>
                    </>
                )}
                {reason === "transferred" && (
                    <p className="text-green-600">
                        Tu sesión fue trasladada a esta pestaña.
                    </p>
                )}
            </div>
        );
    }

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        );
    }

    return (
        <div data-theme={theme}>
            <Navbar />

            <Routes>
                <Route
                    path="/"
                    element={authUser ? <HomePage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/signup"
                    element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
                />
                 <Route
                  path="/contacts"
                  element={authUser ? <ContactsPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/login"
                    element={!authUser ? <LoginPage /> : <Navigate to="/" />}
                />
                <Route path="/settings" element={<SettingsPage />} />
                <Route
                    path="/profile"
                    element={
                        authUser ? <ProfilePage /> : <Navigate to="/login" />
                    }
                />
            </Routes>

            <Toaster />
        </div>
    );
};

export default App;