import axiosInstance from '../axiosInstance';

export const login = async (credentials) => {
    const response = await axiosInstance.post('/users/login', new URLSearchParams(credentials).toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    const { access_token, token_type } = response.data;
    return {access_token, token_type};
};

export const register = async (userData) => {
    const response = await axiosInstance.post('users/register', userData);
    return response.data;
};
export const getUsers = async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
};

export const getUser = async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
};

export const createUser = async (user) => {
    const response = await axiosInstance.post('/users', user);
    return response.data;
};

export const updateUser = async (userId, userData) => {
    const response = await axiosInstance.put(`/users/${userId}`, userData);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response.data;
};
