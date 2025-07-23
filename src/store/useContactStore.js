// store/useContactStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useContactStore = create((set, get) => ({
  contacts: [],
  pendingRequests: { received: [], sent: [] },
  searchResults: [],
  isLoading: false,
  isSearching: false,
  isSendingRequest: false,

  getContacts: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/contacts");
      set({ contacts: res.data });
    } catch (error) {
      console.error("Error getting contacts:", error);
      toast.error("Error al cargar contactos");
    } finally {
      set({ isLoading: false });
    }
  },

  getPendingRequests: async () => {
    try {
      const res = await axiosInstance.get("/contacts/pending");
      set({ pendingRequests: res.data });
    } catch (error) {
      console.error("Error getting pending requests:", error);
      toast.error("Error al cargar solicitudes");
    }
  },

  searchUsers: async (query) => {
    if (!query || query.trim().length < 2) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearching: true });
    try {
      const res = await axiosInstance.get(`/contacts/search?query=${encodeURIComponent(query)}`);
      set({ searchResults: res.data });
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Error en la búsqueda");
      set({ searchResults: [] });
    } finally {
      set({ isSearching: false });
    }
  },

  sendContactRequest: async (contactId) => {
    set({ isSendingRequest: true });
    try {
      await axiosInstance.post("/contacts/request", { contactId });
      toast.success("Solicitud enviada exitosamente");
      
      const { searchResults } = get();
      const updatedResults = searchResults.map(user => 
        user._id === contactId 
          ? { ...user, relationStatus: "pending", canAdd: false }
          : user
      );
      set({ searchResults: updatedResults });
      
      get().getPendingRequests();
    } catch (error) {
      console.error("Error sending contact request:", error);
      toast.error(error.response?.data?.message || "Error al enviar solicitud");
    } finally {
      set({ isSendingRequest: false });
    }
  },

  acceptContactRequest: async (requestId) => {
    try {
      await axiosInstance.put(`/contacts/accept/${requestId}`);
      toast.success("Contacto agregado exitosamente");
      
      get().getContacts();
      get().getPendingRequests();
    } catch (error) {
      console.error("Error accepting contact request:", error);
      toast.error(error.response?.data?.message || "Error al aceptar solicitud");
    }
  },

  rejectContactRequest: async (requestId) => {
    try {
      await axiosInstance.delete(`/contacts/reject/${requestId}`);
      toast.success("Solicitud rechazada");
      
      get().getPendingRequests();
    } catch (error) {
      console.error("Error rejecting contact request:", error);
      toast.error(error.response?.data?.message || "Error al rechazar solicitud");
    }
  },

  removeContact: async (contactId) => {
    try {
      await axiosInstance.delete(`/contacts/${contactId}`);
      toast.success("Contacto eliminado");
      
      const { contacts } = get();
      set({ contacts: contacts.filter(contact => contact._id !== contactId) });
    } catch (error) {
      console.error("Error removing contact:", error);
      toast.error(error.response?.data?.message || "Error al eliminar contacto");
    }
  },

  updateContactNickname: async (contactId, nickname) => {
    try {
      await axiosInstance.put(`/contacts/${contactId}/nickname`, { nickname });
      toast.success("Nickname actualizado");
      
      const { contacts } = get();
      const updatedContacts = contacts.map(contact =>
        contact._id === contactId
          ? { ...contact, fullName: nickname || contact.originalName, nickname }
          : contact
      );
      set({ contacts: updatedContacts });
    } catch (error) {
      console.error("Error updating nickname:", error);
      toast.error(error.response?.data?.message || "Error al actualizar nickname");
    }
  },

  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  reset: () => {
    set({
      contacts: [],
      pendingRequests: { received: [], sent: [] },
      searchResults: [],
      isLoading: false,
      isSearching: false,
      isSendingRequest: false,
    });
  }
}));