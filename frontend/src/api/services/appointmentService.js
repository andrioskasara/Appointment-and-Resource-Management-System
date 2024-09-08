import axiosInstance from '../axiosInstance';

export const getAppointments = async (userId) => {
    const response = await axiosInstance.get('/appointments', { params: { user_id: userId } });
    return response.data;
};

export const getAppointment = async (appointmentId) => {
    const response = await axiosInstance.get(`/appointments/${appointmentId}`);
    return response.data;
};

export const getAppointmentsByFilter = async (filters) => {
    const response = await axiosInstance.get('/appointments/filter', { params: filters });
    return response.data;
};

export const createAppointment = async (appointmentData) => {
    const response = await axiosInstance.post('/appointments', appointmentData);
    return response.data;
};

export const updateAppointment = async (appointmentId, appointmentData) => {
    const response = await axiosInstance.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
};

export const deleteAppointment = async (appointmentId) => {
    const response = await axiosInstance.delete(`/appointments/${appointmentId}`);
    return response.data;
};
