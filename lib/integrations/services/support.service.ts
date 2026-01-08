import { SUPPORT_ENDPOINTS } from '../config/endpoints';
import { apiClient } from '../api/apiClient';
import { SupportTicket } from '../types/support';

export const supportService = {
    createTicket: async (formData: FormData) => {
        return apiClient<SupportTicket>(SUPPORT_ENDPOINTS.CREATE, {
            method: 'POST',
            body: formData,
        });
    },

    getMyTickets: () => {
        return apiClient<SupportTicket[]>(SUPPORT_ENDPOINTS.MY_TICKETS);
    },

    getTicketDetails: (id: string) => {
        return apiClient<SupportTicket>(SUPPORT_ENDPOINTS.DETAILS(id));
    }
};
