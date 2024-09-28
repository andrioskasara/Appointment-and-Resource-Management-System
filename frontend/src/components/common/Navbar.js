import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import useUser from "../../hooks/useUser";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
    const { authState, logoutUser } = useAuth();
    const { user } = useUser();

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
                >
                    Appointment & Resource Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {user && user.role === 'user' && (
                        <Button color="inherit" component={Link} to="/appointments">
                            My Appointments
                        </Button>
                    )}
                    {user && user.role === 'admin' && (
                        <Button color="inherit" component={Link} to="/appointments">
                            Appointments
                        </Button>
                    )}
                    {user && user.role === 'user' && (
                        <Button color="inherit" component={Link} to="/appointments/new">
                            Create Appointment
                        </Button>
                    )}
                    {user && user.role === 'admin' && (
                        <Button color="inherit" component={Link} to="/admin">
                            Admin Dashboard
                        </Button>
                    )}
                </Box>
                <Box sx={{ marginLeft: 2 }}>
                    {authState.token ? (
                        <Button color="inherit" onClick={logoutUser}>
                            Logout
                        </Button>
                    ) : (
                        <Button color="inherit" component={Link} to="/login">
                            Login
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
