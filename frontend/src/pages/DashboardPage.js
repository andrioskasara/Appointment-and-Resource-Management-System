import React from 'react';
import useUser from "../hooks/useUser";
import {Box, Button, Container, Stack, Typography} from "@mui/material";
import {Link} from "react-router-dom";

const DashboardPage = () => {
    const {user} = useUser();

    return (
        <Container>
            <Box sx={{mt: 8}}>
                <Typography variant="h4">Welcome to the Appointment and Resource Management System</Typography>
                <Stack spacing={2} sx={{mt: 4}}>
                    <Button variant="contained" color="primary" component={Link} to="/rooms">
                        View Rooms
                    </Button>
                    <Button variant="contained" color="primary" component={Link} to="/resources">
                        View Resources
                    </Button>
                    <Button variant="contained" color="primary" component={Link} to="/appointments">
                        View Appointments
                    </Button>
                    {user && user.role !== 'admin' && (
                        <Button variant="contained" color="primary" component={Link} to="/appointments/new">
                            Make an Appointment
                        </Button>
                    )}
                    {user && user.role === 'admin' && (
                        <Button variant="contained" color="primary" component={Link} to="/admin">
                            Admin Dashboard
                        </Button>
                    )}
                </Stack>
            </Box>
        </Container>
    );
};

export default DashboardPage;
