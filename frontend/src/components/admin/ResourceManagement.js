import React, {useState, useEffect} from 'react';
import {DataGrid} from '@mui/x-data-grid';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography, Container, Box
} from '@mui/material';
import {getResources, createResource, updateResource, deleteResource} from '../../api/services/resourceService';
import AddIcon from "@mui/icons-material/Add";

const RESOURCE_TYPES = {
    fixed: "Fixed",
    movable: "Movable",
};

const AVAILABILITY_STATUSES = {
    available: "Available",
    unavailable: "Unavailable",

};
const ResourceManagement = () => {
    const [resources, setResources] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [formData, setFormData] = useState({name: '', type: 'fixed', quantity: 1, availability: 'available'});
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadResources = async () => {
            const data = await getResources();
            setResources(data);
        };
        loadResources().catch((error) => {
            console.error('Unexpected error:', error);
        });
    }, []);

    const handleOpenDialog = (resource = null) => {
        setSelectedResource(resource);
        setFormData(resource ? {...resource} : {name: '', type: 'fixed', quantity: 1, availability: 'available'});
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleSubmit = async () => {
        try {
            if (selectedResource) {
                await updateResource(selectedResource.id, formData);
            } else {
                await createResource(formData);
            }
            setOpen(false);
            const updatedResources = await getResources();
            setResources(updatedResources);
        } catch (error) {
            console.error('Error while submitting resource:', error);
            setError('Failed to submit resource');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteResource(id);
            const updatedResources = await getResources();
            setResources(updatedResources);
        } catch (error) {
            console.error('Error while deleting resource:', error);
            setError('Failed to delete resource');
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const columns = [
        {field: 'name', headerName: 'Resource Name', flex: 1},
        {field: 'type', headerName: 'Type', flex: 1},
        {field: 'availability', headerName: 'Availability', flex: 1},
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            renderCell: (params) => (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog(params.row)}
                        style={{marginRight: 10}}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDelete(params.row.id)}
                    >
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <Container maxWidth="lg">
            <Box sx={{mt: 4, mb: 4, px: 2}}>
                <Typography variant="h4" gutterBottom>
                    Resource Management
                </Typography>
                {error && <Typography color="error">Error: {error}</Typography>}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog()}
                    startIcon={<AddIcon/>}
                    style={{marginBottom: 20}}
                >
                    Add Resource
                </Button>
                <DataGrid rows={resources} columns={columns} pageSize={10}/>
            </Box>
            <Dialog open={open} onClose={handleCloseDialog}>
                <DialogTitle>{selectedResource ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Resource Name"
                        type="text"
                        fullWidth
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Type</InputLabel>
                        <Select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            label="Type"
                        >
                            {Object.entries(RESOURCE_TYPES).map(([value, label]) => (
                                <MenuItem key={value} value={value}>
                                    {label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Availability</InputLabel>
                        <Select
                            name="availability"
                            value={formData.availability}
                            onChange={handleInputChange}
                            label="Availability"
                        >
                            {Object.entries(AVAILABILITY_STATUSES).map(([value, label]) => (
                                <MenuItem key={value} value={value}>
                                    {label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        {selectedResource ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ResourceManagement;
