import React from 'react';
import {Box, Container, Typography} from "@mui/material";

const NotFoundPage = () => {
    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h3" gutterBottom>
                    404
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Page Not Found
                </Typography>
                <Typography variant="body1">
                    Sorry, the page you're looking for doesn't exist.
                </Typography>
            </Box>
        </Container>
    );
};

export default NotFoundPage;
