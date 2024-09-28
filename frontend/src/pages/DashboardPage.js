import React from 'react';
import { Box, Button, Container, Grid, Typography, Paper, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import useUser from "../hooks/useUser";

const DashboardPage = () => {
    const { user } = useUser();

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh', pt: 8 }}>
            <IconButton
                component={Link}
                to="/calendar"
                color="primary"
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    boxShadow: 3,
                    bgcolor: 'background.paper',
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                }}
            >
                <CalendarTodayIcon />
            </IconButton>

            <Container>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h3" gutterBottom>
                        Welcome to the Appointment and Resource Management System
                    </Typography>
                </Box>
                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={6} sx={{ padding: 4, textAlign: 'center' }}>
                            <Typography variant="h5" gutterBottom>
                                Appointments
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                Explore all past and upcoming appointments.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                component={Link}
                                to="/appointments"
                            >
                                View Appointments
                            </Button>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={6} sx={{ padding: 4, textAlign: 'center' }}>
                            <Typography variant="h5" gutterBottom>
                                Resources
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                Explore resources and see their current status and details.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                component={Link}
                                to="/resources"
                            >
                                View Resources
                            </Button>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper elevation={6} sx={{ padding: 4, textAlign: 'center' }}>
                            <Typography variant="h5" gutterBottom>
                                Rooms
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                Find rooms that suit your needs and learn more about their amenities.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                component={Link}
                                to="/rooms"
                            >
                                View Rooms
                            </Button>
                        </Paper>
                    </Grid>
                    {user && user.role !== 'admin' && (
                        <Grid item xs={12} sm={6} md={4}>
                            <Paper elevation={6} sx={{ padding: 4, textAlign: 'center' }}>
                                <Typography variant="h5" gutterBottom>
                                    Make an Appointment
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    Schedule a new appointment for yourself. Choose a room and resources.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    component={Link}
                                    to="/appointments/new"
                                >
                                    Make an Appointment
                                </Button>
                            </Paper>
                        </Grid>
                    )}
                    {user && user.role === 'admin' && (
                        <Grid item xs={12} sm={6} md={4}>
                            <Paper elevation={6} sx={{ padding: 4, textAlign: 'center' }}>
                                <Typography variant="h5" gutterBottom>
                                    Admin Dashboard
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    Manage resources and rooms from the admin dashboard.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    component={Link}
                                    to="/admin"
                                >
                                    Go to Admin Dashboard
                                </Button>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default DashboardPage;
