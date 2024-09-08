import React from 'react';
import {Link} from 'react-router-dom';
import {AppBar, Toolbar, Typography, Button} from '@mui/material';
import useUser from "../../hooks/useUser";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
    const { authState, logoutUser } = useAuth();
    const { user } = useUser();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    My App
                </Typography>
                <Button color="inherit" component={Link} to="/">Home</Button>
                <Button color="inherit" component={Link} to="/appointments">Appointments</Button>
                <Button color="inherit" component={Link} to="/resources">Resources</Button>
                <Button color="inherit" component={Link} to="/rooms">Rooms</Button>
                {user && user.role === 'admin' && (
                    <>
                        <Button color="inherit" component={Link} to="/admin">Admin Dashboard</Button>
                    </>
                )}
                {authState.token ? (
                    <Button color="inherit" onClick={logoutUser}>Logout</Button>
                ) : (
                    <Button color="inherit" component={Link} to="/login">Login</Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
