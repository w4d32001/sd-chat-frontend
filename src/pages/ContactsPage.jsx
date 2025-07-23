// pages/ContactsPage.jsx
import { useState, useEffect } from "react";
import { useContactStore } from "../store/useContactStore";
import { 
  Search, 
  UserPlus, 
  Users, 
  Clock, 
  Check, 
  X, 
  Trash2, 
  Edit3,
  Loader,
} from "lucide-react";

const ContactsPage = () => {
  const [activeTab, setActiveTab] = useState("contacts");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNickname, setEditingNickname] = useState(null);
  const [newNickname, setNewNickname] = useState("");

  const {
    contacts,
    pendingRequests,
    searchResults,
    isLoading,
    isSearching,
    isSendingRequest,
    getContacts,
    getPendingRequests,
    searchUsers,
    sendContactRequest,
    acceptContactRequest,
    rejectContactRequest,
    removeContact,
    updateContactNickname,
    clearSearchResults
  } = useContactStore();

  useEffect(() => {
    getContacts();
    getPendingRequests();
  }, [getContacts, getPendingRequests]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === "search") {
        searchUsers(searchQuery);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeTab, searchUsers]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "search") {
      setSearchQuery("");
      clearSearchResults();
    }
  };

  const handleNicknameEdit = (contact) => {
    setEditingNickname(contact._id);
    setNewNickname(contact.nickname || contact.originalName || contact.fullName);
  };

  const handleNicknameSave = async (contactId) => {
    await updateContactNickname(contactId, newNickname);
    setEditingNickname(null);
    setNewNickname("");
  };

  const handleNicknameCancel = () => {
    setEditingNickname(null);
    setNewNickname("");
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Gestión de Contactos
        </h1>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => handleTabChange("contacts")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "contacts"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Users className="inline-block w-4 h-4 mr-2" />
            Contactos ({contacts.length})
          </button>
          
          <button
            onClick={() => handleTabChange("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Clock className="inline-block w-4 h-4 mr-2" />
            Pendientes ({pendingRequests.received.length + pendingRequests.sent.length})
          </button>
          
          <button
            onClick={() => handleTabChange("search")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "search"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Search className="inline-block w-4 h-4 mr-2" />
            Buscar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="p-4 h-full flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar usuarios por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {isSearching && (
                <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron usuarios
                </div>
              )}
              
              {searchResults.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {user.fullName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {user.relationStatus !== "none" && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.relationStatus)}`}>
                        {user.relationStatus === "pending" ? "Pendiente" : 
                         user.relationStatus === "accepted" ? "Contacto" : 
                         user.relationStatus === "blocked" ? "Bloqueado" : ""}
                      </span>
                    )}
                    
                    {user.canAdd && (
                      <button
                        onClick={() => sendContactRequest(user._id)}
                        disabled={isSendingRequest}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      >
                        {isSendingRequest ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === "contacts" && (
          <div className="p-4 h-full overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-6 h-6 animate-spin" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tienes contactos aún</p>
                <p className="text-sm text-gray-400 mt-2">
                  Ve a la pestaña Buscar para agregar contactos
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div key={contact._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <img
                        src={contact.profilePic || "/avatar.png"}
                        alt={contact.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        {editingNickname === contact._id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={newNickname}
                              onChange={(e) => setNewNickname(e.target.value)}
                              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleNicknameSave(contact._id)}
                              className="p-1 text-green-600 hover:text-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleNicknameCancel}
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {contact.fullName}
                              </h3>
                              <button
                                onClick={() => handleNicknameEdit(contact)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                            {contact.nickname && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {contact.originalName}
                              </p>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {contact.email}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {new Date(contact.addedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => removeContact(contact._id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "pending" && (
          <div className="p-4 h-full overflow-y-auto">
            {pendingRequests.received.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Solicitudes Recibidas ({pendingRequests.received.length})
                </h2>
                <div className="space-y-2">
                  {pendingRequests.received.map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-3">
                        <img
                          src={request.user.profilePic || "/avatar.png"}
                          alt={request.user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {request.user.fullName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {request.user.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => acceptContactRequest(request._id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>Aceptar</span>
                        </button>
                        <button
                          onClick={() => rejectContactRequest(request._id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingRequests.sent.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Solicitudes Enviadas ({pendingRequests.sent.length})
                </h2>
                <div className="space-y-2">
                  {pendingRequests.sent.map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center space-x-3">
                        <img
                          src={request.user.profilePic || "/avatar.png"}
                          alt={request.user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {request.user.fullName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {request.user.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Enviada el {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs font-medium">
                          Pendiente
                        </span>
                        <button
                          onClick={() => rejectContactRequest(request._id)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingRequests.received.length === 0 && pendingRequests.sent.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tienes solicitudes pendientes</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;