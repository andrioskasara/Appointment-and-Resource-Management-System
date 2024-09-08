import axiosInstance from '../axiosInstance';

export const getRooms = async () => {
    const response = await axiosInstance.get('/rooms');
    return response.data;
};

export const getRoom = async (roomId) => {
    const response = await axiosInstance.get(`/rooms/${roomId}`);
    return response.data;
};

export const createRoom = async (roomData) => {
    const response = await axiosInstance.post('/rooms', roomData);
    return response.data;
};

export const updateRoom = async (roomId, roomData) => {
    const response = await axiosInstance.put(`/rooms/${roomId}`, roomData);
    return response.data;
};

export const deleteRoom = async (roomId) => {
    const response = await axiosInstance.delete(`/rooms/${roomId}`);
    return response.data;
};

export const getAvailableRooms = async (startTime, endTime) => {
    const response = await axiosInstance.get(`/rooms/available?start_time=${startTime}&end_time=${endTime}`);
    return response.data;
};