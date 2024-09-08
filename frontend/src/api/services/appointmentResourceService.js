import axiosInstance from '../axiosInstance';

export const getAppointmentResources = async (appointmentId) => {
    const response = await axiosInstance.get(`/appointment-resources?appointment_id=${appointmentId}`);
    return response.data;
};

export const createAppointmentResource = async (appointmentData) => {
    const response = await axiosInstance.post('/appointment-resources', appointmentData);
    return response.data;
};

export const updateAppointmentResource = async (appointmentId, appointmentData) => {
    const response = await axiosInstance.put(`/appointment-resources/${appointmentId}`, appointmentData);
    return response.data;
};

export const deleteAppointmentResource = async (appointmentId) => {
    const response = await axiosInstance.delete(`/appointment-resources/${appointmentId}`);
    return response.data;
};

export const getMovableResourcesForAppointment = async (appointmentId) => {
    const response = await axiosInstance.get(`/appointment-resources/movable/${appointmentId}`);
    return response.data;
};