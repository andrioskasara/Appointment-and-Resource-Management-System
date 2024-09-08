import axiosInstance from '../axiosInstance';

export const getResources = async () => {
    const response = await axiosInstance.get('/resources');
    return response.data;
};

export const getResource = async (resourceId) => {
    const response = await axiosInstance.get(`/resources/${resourceId}`);
    return response.data;
};

export const getAvailableResources = async () => {
    const response = await axiosInstance.get('/resources/available');
    return response.data;
};

export const getAvailableMovableResources = async (startTime, endTime) => {
    const response = await axiosInstance.get(`/resources/movable/available?start_time=${startTime}&end_time=${endTime}`);
    return response.data;
};

export const createResource = async (resourceData) => {
    const response = await axiosInstance.post('/resources', resourceData);
    return response.data;
};

export const updateResource = async (resourceId, resourceData) => {
    const response = await axiosInstance.put(`/resources/${resourceId}`, resourceData);
    return response.data;
};

export const deleteResource = async (resourceId) => {
    const response = await axiosInstance.delete(`/resources/${resourceId}`);
    return response.data;
};
