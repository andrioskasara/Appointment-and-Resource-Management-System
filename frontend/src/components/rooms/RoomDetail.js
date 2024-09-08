import React from 'react';
import {Card, CardContent, Typography, Button, CardHeader, Box} from '@mui/material';

const RoomDetail = ({ room, onClose }) => {
    if (!room) return null;

    return (
        <Card sx={{ width: 400, margin: 2 }}>
            <CardHeader
                title="Room Details"
                action={
                    <Button variant="outlined" color="primary" onClick={onClose}>
                        Close
                    </Button>
                }
                sx={{ paddingBottom: 0 }}
            />
            <CardContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        {room.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Capacity: {room.capacity}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Resources: {room.fixed_resources.map(resource => resource.name).join(', ')}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default RoomDetail;

