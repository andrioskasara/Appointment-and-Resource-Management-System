import React, {useState, useEffect} from 'react';
import {DataGrid} from '@mui/x-data-grid';
import {
    Button,
    Box,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItemText,
    TextField, List, ListItem, IconButton, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {getRooms, createRoom, updateRoom, deleteRoom} from '../../api/services/roomService';
import {getResources} from "../../api/services/resourceService";

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [resources, setResources] = useState([]);
    const [availableResources, setAvailableResources] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [formData, setFormData] = useState({name: '', capacity: 0, fixed_resources: []});

    useEffect(() => {
        const loadRoomsAndResources = async () => {
            try {
                const roomData = await getRooms();
                setRooms(roomData);

                const allResources = await getResources();
                setResources(allResources);
                const assignedResourceIds = roomData.flatMap(room => room.fixed_resources.map(r => r.id));
                const availableResources = allResources.filter(resource => !assignedResourceIds.includes(resource.id));
                setAvailableResources(availableResources);
            } catch (error) {
                console.error('Unexpected error:', error);
            }
        };
        loadRoomsAndResources().catch((error) => {
            console.error('Unexpected error:', error);
        });
    }, []);

    const handleOpenDialog = (room = null) => {
        setSelectedRoom(room);
        setFormData(room ? {...room, fixed_resources: room.fixed_resources.map(r => r.id)} : {
            name: '',
            capacity: 0,
            fixed_resources: []
        });
        setOpen(true);
    };

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const handleSubmit = async () => {
        try {
            if (selectedRoom) {
                await updateRoom(selectedRoom.id, {...formData, fixed_resources: formData.fixed_resources});
            } else {
                await createRoom(formData);
            }
            setOpen(false);
            const updatedRooms = await getRooms();
            setRooms(updatedRooms);
        } catch (error) {
            console.error('Failed to submit room data:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteRoom(id);
            const updatedRooms = await getRooms();
            setRooms(updatedRooms);
        } catch (error) {
            console.error('Failed to delete room:', error);
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleAddResource = (resourceId) => {
        setFormData(prevState => ({
            ...prevState,
            fixed_resources: [...prevState.fixed_resources, resourceId]
        }));
    };

    const handleRemoveResource = (resourceId) => {
        setFormData(prevState => ({
            ...prevState,
            fixed_resources: prevState.fixed_resources.filter(id => id !== resourceId)
        }));
    };

    const columns = [
        {field: 'name', headerName: 'Room Name', flex: 1},
        {field: 'capacity', headerName: 'Capacity', flex: 1},
        {
            field: 'fixed_resources',
            headerName: 'Fixed Resources',
            flex: 1,
            renderCell: (params) => (
                <div>
                    {params.row.fixed_resources.map((resource, index) => (
                        <span key={index}>
                        {resource.name}{index < params.row.fixed_resources.length - 1 ? ', ' : ''}
                    </span>
                    ))}
                </div>
            ),
        },
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
                    Room Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog()}
                    startIcon={<AddIcon/>}
                    style={{marginBottom: 20}}
                >
                    Add Room
                </Button>
                <Box sx={{height: 600, width: '100%'}}>
                    <DataGrid rows={rooms} columns={columns} pageSize={10}/>
                </Box>
            </Box>

            <Dialog open={open} onClose={handleCloseDialog}>
                <DialogTitle>{selectedRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Room Name"
                        type="text"
                        fullWidth
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="capacity"
                        label="Capacity"
                        type="number"
                        fullWidth
                        value={formData.capacity}
                        onChange={handleInputChange}
                    />
                    <Box display="flex" justifyContent="space-between">
                        <Box width="45%">
                            <Typography variant="h6" gutterBottom>
                                Available Resources
                            </Typography>
                            <List>
                                {availableResources.map((resource) => (
                                    <ListItem
                                        key={resource.id}
                                        secondaryAction={
                                            <IconButton edge="end" onClick={() => handleAddResource(resource.id)}>
                                                <AddIcon/>
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText primary={resource.name}/>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                        <Box width="45%">
                            <Typography variant="h6" gutterBottom>
                                Selected Resources
                            </Typography>
                            <List>
                                {formData.fixed_resources.map((resourceId) => {
                                    const resource = resources.find(r => r.id === resourceId);
                                    return resource ? (
                                        <ListItem
                                            key={resource.id}
                                            secondaryAction={
                                                <IconButton edge="end"
                                                            onClick={() => handleRemoveResource(resource.id)}>
                                                    <RemoveIcon/>
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText primary={resource.name}/>
                                        </ListItem>
                                    ) : null;
                                })}
                            </List>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        {selectedRoom ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RoomManagement;
