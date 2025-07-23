import { useEffect, useState } from "react";

const SESSION_KEY = "active_chat_tab";

export const useSingleTabChat = (transfer = true) => {
  const [isActive, setIsActive] = useState(false);
  const tabId = window.crypto.randomUUID();

  useEffect(() => {
    const checkSession = () => {
      const activeTab = localStorage.getItem(SESSION_KEY);

      if (!activeTab) {
        localStorage.setItem(SESSION_KEY, tabId);
        setIsActive(true);
      } else if (activeTab === tabId) {
        setIsActive(true);
      } else if (transfer) {
        localStorage.setItem(SESSION_KEY, tabId);
        setIsActive(true);
        window.dispatchEvent(new Event("chat-tab-changed")); 
      } else {
        setIsActive(false);
      }
    };

    checkSession();

    const handleStorage = (e) => {
      if (e.key === SESSION_KEY) {
        if (e.newValue !== tabId) {
          setIsActive(false);
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    const handleTabChanged = () => {
      if (localStorage.getItem(SESSION_KEY) !== tabId) {
        setIsActive(false);
      }
    };
    window.addEventListener("chat-tab-changed", handleTabChanged);

    const handleUnload = () => {
      if (localStorage.getItem(SESSION_KEY) === tabId) {
        localStorage.removeItem(SESSION_KEY);
      }
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("chat-tab-changed", handleTabChanged);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [tabId, transfer]);

  return isActive;
};
