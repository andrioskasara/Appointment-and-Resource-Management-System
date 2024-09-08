import React from 'react';
import {Link} from "react-router-dom";
import {Box, Button, Container, Stack, Typography} from "@mui/material";

const AdminPage = () => {
    return (
        <Container>
            <Box sx={{ mt: 8 }}>
                <Typography variant="h4">Admin Dashboard</Typography>
                <Stack spacing={2} sx={{ mt: 4 }}>
                    <Button variant="contained" color="primary" component={Link} to="/admin/resources">
                        Resource Management
                    </Button>
                    <Button variant="contained" color="primary" component={Link} to="/admin/rooms">
                        Room Management
                    </Button>
                </Stack>
            </Box>
        </Container>
    );
};

export default AdminPage;
