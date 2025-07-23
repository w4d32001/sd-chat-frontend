import { useEffect, useState } from "react";

const SESSION_KEY = "active_chat_tab";

export const useSingleTabChat = (transfer = true) => {
  const [isActive, setIsActive] = useState(false);
  const [reason, setReason] = useState(""); // para mensajes más claros
  const tabId = window.crypto.randomUUID();

  useEffect(() => {
    const activeTab = localStorage.getItem(SESSION_KEY);

    if (!activeTab) {
      // No hay pestaña activa, tomar el control inmediatamente
      localStorage.setItem(SESSION_KEY, tabId);
      setIsActive(true);
      setReason("active");
    } else if (activeTab === tabId) {
      // Esta pestaña ya es la activa
      setIsActive(true);
      setReason("active");
    } else if (transfer) {
      // Tomar el control y avisar a la anterior
      localStorage.setItem(SESSION_KEY, tabId);
      setIsActive(true);
      setReason("transferred");
      window.dispatchEvent(new Event("chat-tab-changed"));
    } else {
      // No tomar control (otra pestaña sigue activa)
      setIsActive(false);
      setReason("blocked");
    }

    // Escuchar cambios (otra pestaña toma control)
    const handleStorage = (e) => {
      if (e.key === SESSION_KEY && e.newValue !== tabId) {
        setIsActive(false);
        setReason("blocked");
      }
    };
    window.addEventListener("storage", handleStorage);

    // Al cerrar, liberar el control
    const handleUnload = () => {
      if (localStorage.getItem(SESSION_KEY) === tabId) {
        localStorage.removeItem(SESSION_KEY);
      }
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [tabId, transfer]);

  return { isActive, reason };
};
