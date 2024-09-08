import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { register } from '../api/services/userService';
import {Box, Button, Container, TextField, Typography} from "@mui/material";

const RegisterPage = () => {
    const [userData, setUserData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await register(userData);
        navigate('/login');
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ mt: 8 }}>
                <Typography variant="h5">Register</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="username"
                        value={userData.username}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Email"
                        type="email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="password"
                        value={userData.password}
                        onChange={handleChange}
                        required
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ mt: 3 }}
                    >
                        Register
                    </Button>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            Already have an account? <Link to="/login">Login</Link>
                        </Typography>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};

export default RegisterPage;
