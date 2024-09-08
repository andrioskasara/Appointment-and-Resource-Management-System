import React, { useEffect, useState } from 'react';
import {
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Container,
    Box,
    Typography,
    Stack, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { getResources, getAvailableMovableResources } from '../../api/services/resourceService';

const ResourceList = () => {
    const [resources, setResources] = useState([]);
    const [filterType, setFilterType] = useState('');
    const [filterAvailability, setFilterAvailability] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadResources = async () => {
            try {
                let filteredResources = await getResources();

                if (filterType) {
                    filteredResources = filteredResources.filter(resource => resource.type === filterType);
                }

                if (filterAvailability === 'available') {
                    filteredResources = filteredResources.filter(resource => resource.availability === 'available');
                } else if (filterAvailability === 'unavailable') {
                    filteredResources = filteredResources.filter(resource => resource.availability === 'unavailable');
                }

                setResources(filteredResources);
            } catch (error) {
                console.error('Error while filtering resources:', error);
                setError('Failed to fetch resources');
            }
        };

        loadResources().catch((error) => {
            console.error('Unexpected error:', error);
        });
    }, [filterType, filterAvailability]);

    const handleAvailableMovableResources = async () => {
        if (!startTime || !endTime) {
            console.error('Start time and end time must be specified');
            return;
        }

        try {
            const availableMovableResources = await getAvailableMovableResources(startTime, endTime);
            setResources(availableMovableResources);
        } catch (error) {
            console.error('Error fetching available movable resources:', error);
            setError('Failed to fetch available movable resources');
        }
    };

    return (
        <Container>
            <Box sx={{ mt: 8 }}>
                <Typography variant="h4">Resource List</Typography>
                {error ? (
                    <Typography variant="h6" color="error">
                        Error: {error}
                    </Typography>
                ) : (
                    <Stack spacing={2} sx={{ mt: 4 }}>
                        <FormControl variant="outlined" style={{ marginBottom: '20px' }}>
                            <InputLabel>Filter by Type</InputLabel>
                            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="fixed">Fixed</MenuItem>
                                <MenuItem value="movable">Movable</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" style={{ marginBottom: '20px' }}>
                            <InputLabel>Filter by Availability</InputLabel>
                            <Select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)}>
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="available">Available</MenuItem>
                                <MenuItem value="unavailable">Unavailable</MenuItem>
                            </Select>
                        </FormControl>
                        <Stack spacing={2} direction="row" sx={{ mb: 4 }}>
                            <TextField
                                label="Start Time"
                                type="datetime-local"
                                InputLabelProps={{ shrink: true }}
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                            <TextField
                                label="End Time"
                                type="datetime-local"
                                InputLabelProps={{ shrink: true }}
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                            <Button variant="contained" color="primary" onClick={handleAvailableMovableResources}>
                                Find Available Movable Resources
                            </Button>
                        </Stack>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Resource Name</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Availability</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {resources.map((resource) => (
                                        <TableRow key={resource.id}>
                                            <TableCell>{resource.name}</TableCell>
                                            <TableCell>{resource.type === 'fixed' ? 'Fixed' : 'Movable'}</TableCell>
                                            <TableCell>{resource.availability === 'available' ? 'Available' : 'Unavailable'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                )}
            </Box>
        </Container>
    );
};

export default ResourceList;
