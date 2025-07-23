import { useEffect, useState, useRef } from "react";

const SESSION_KEY = "active_chat_tab";

export const useSingleTabChat = (transfer = true) => {
  const [isActive, setIsActive] = useState(false);
  const [reason, setReason] = useState("");
  
  const tabIdRef = useRef(null);
  
  if (!tabIdRef.current) {
    tabIdRef.current = window.crypto.randomUUID();
  }

  useEffect(() => {
    const tabId = tabIdRef.current;
    
    const initializeTab = () => {
      const activeTab = localStorage.getItem(SESSION_KEY);

      if (!activeTab) {
        localStorage.setItem(SESSION_KEY, tabId);
        setIsActive(true);
        setReason("active");
      } else if (activeTab === tabId) {
        setIsActive(true);
        setReason("active");
      } else if (transfer) {
        localStorage.setItem(SESSION_KEY, tabId);
        setIsActive(true);
        setReason("transferred");
        window.dispatchEvent(new Event("chat-tab-changed"));
      } else {
        setIsActive(false);
        setReason("blocked");
      }
    };

    initializeTab();

    const handleStorage = (e) => {
      if (e.key === SESSION_KEY && e.newValue !== tabId) {
        setIsActive(false);
        setReason("blocked");
      }
    };

    const handleTabChanged = () => {
      const activeTab = localStorage.getItem(SESSION_KEY);
      if (activeTab !== tabId) {
        setIsActive(false);
        setReason("blocked");
      }
    };

    const handleFocus = () => {
      const activeTab = localStorage.getItem(SESSION_KEY);
      if (!activeTab && transfer) {
        localStorage.setItem(SESSION_KEY, tabId);
        setIsActive(true);
        setReason("transferred");
        window.dispatchEvent(new Event("chat-tab-changed"));
      }
    };

    const handleUnload = () => {
      const activeTab = localStorage.getItem(SESSION_KEY);
      if (activeTab === tabId) {
        localStorage.removeItem(SESSION_KEY);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("chat-tab-changed", handleTabChanged);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("chat-tab-changed", handleTabChanged);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [transfer]); 

  const forceActivate = () => {
    const tabId = tabIdRef.current;
    localStorage.setItem(SESSION_KEY, tabId);
    setIsActive(true);
    setReason("transferred");
    window.dispatchEvent(new Event("chat-tab-changed"));
  };

  return { 
    isActive, 
    reason, 
    forceActivate 
  };
};