import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import { getAvailableRooms, getRoom } from "../../api/services/roomService";
import { getAvailableMovableResources } from "../../api/services/resourceService";
import RoomDetail from "../rooms/RoomDetail";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useUser from "../../hooks/useUser";

const AppointmentForm = ({ appointmentData, onSubmit, loading, error, prepopulateFields }) => {
    const [resources, setResources] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedResources, setSelectedResources] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [roomDetail, setRoomDetail] = useState(null);
    const [roomError, setRoomError] = useState('');
    const [resourceError, setResourceError] = useState('');
    const [timeError, setTimeError] = useState('');
    const { user } = useUser();

    useEffect(() => {
        if (prepopulateFields && appointmentData) {
            setSelectedRoom(appointmentData.room_id || '');
            setSelectedResources(appointmentData.resource_ids || []);
            setStartTime(appointmentData.start_time || '');
            setEndTime(appointmentData.end_time || '');
        }
    }, [appointmentData, prepopulateFields]);

    useEffect(() => {
        const fetchAvailableRooms = async () => {
            if (startTime && endTime) {
                try {
                    const availableRoomsData = await getAvailableRooms(startTime, endTime);

                    if (selectedRoom) {
                        const selectedRoomDetail = await getRoom(selectedRoom);
                        if (!availableRoomsData.some(room => room.id === selectedRoom)) {
                            availableRoomsData.unshift(selectedRoomDetail);
                        }
                    }

                    setAvailableRooms(availableRoomsData);
                    setRoomError(availableRoomsData.length === 0 ? 'No rooms available for the selected time.' : '');
                } catch (error) {
                    console.error('Error fetching available rooms:', error);
                }
            }
        };

        fetchAvailableRooms().catch(console.error);
    }, [startTime, endTime, selectedRoom]);

    useEffect(() => {
        const fetchResources = async () => {
            if (startTime && endTime) {
                try {
                    const availableResources = await getAvailableMovableResources(startTime, endTime);
                    setResources(availableResources);
                    setResourceError(availableResources.length === 0 ? 'No resources available for the selected time.' : '');
                } catch (error) {
                    console.error('Error fetching resources:', error);
                }
            }
        };
        fetchResources().catch(console.error);
    }, [startTime, endTime]);

    useEffect(() => {
        const fetchRoomDetail = async () => {
            if (selectedRoom) {
                try {
                    const detail = await getRoom(selectedRoom);
                    setRoomDetail(detail);
                } catch (error) {
                    console.error('Error fetching room details:', error);
                    setRoomDetail(null);
                }
            }
        };
        fetchRoomDetail().catch(console.error);
    }, [selectedRoom]);

    const handleRoomChange = (e) => {
        const roomId = e.target.value;
        setSelectedRoom(roomId);

        const room = availableRooms.find(room => room.id === roomId);
        setRoomDetail(room || null);
    };

    const handleResourceChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setSelectedResources(prev =>
            e.target.checked
                ? [...prev, value]
                : prev.filter(id => id !== value)
        );
    };

    const validateTimes = () => {
        if (!startTime || !endTime) {
            setTimeError('Both start time and end time must be selected.');
            return false;
        }
        if (new Date(startTime) >= new Date(endTime)) {
            setTimeError('Start time must be before end time.');
            return false;
        }
        setTimeError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateTimes()) return;
        onSubmit({
            user_id: user.id,
            room_id: selectedRoom,
            start_time: startTime,
            end_time: endTime,
            resource_ids: selectedResources,
        });
    };

    return (
        <Box sx={{ m: 8 }}>
            <Typography variant="h4" gutterBottom sx={{ marginBottom: 4 }}>
                {prepopulateFields ? 'Edit Appointment' : 'Make an Appointment'}
            </Typography>
            <form onSubmit={handleSubmit}>
                {loading && <CircularProgress />}

                {timeError && (
                    <Typography color="error" sx={{ marginBottom: 2 }}>
                        {timeError}
                    </Typography>
                )}

                <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            type="datetime-local"
                            label="Start Time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            sx={{ marginBottom: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            type="datetime-local"
                            label="End Time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            sx={{ marginBottom: 2 }}
                        />
                    </Grid>
                </Grid>

                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel id="room-label">Select Room</InputLabel>
                    <Select
                        labelId="room-label"
                        value={selectedRoom || ''}
                        onChange={handleRoomChange}
                        required
                    >
                        <MenuItem value="">Select Room</MenuItem>
                        {availableRooms.map((room) => (
                            <MenuItem key={room.id} value={room.id}>
                                {room.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {roomError && <Typography color="error">{roomError}</Typography>}

                <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="h6">Select Resources</Typography>
                    {resources.map((resource) => (
                        <FormControlLabel
                            key={resource.id}
                            control={
                                <Checkbox
                                    value={resource.id}
                                    checked={selectedResources.includes(resource.id)}
                                    onChange={handleResourceChange}
                                />
                            }
                            label={resource.name}
                        />
                    ))}
                    {resourceError && <Typography color="error">{resourceError}</Typography>}
                </Box>

                <Button type="submit" variant="contained" color="primary">
                    {prepopulateFields ? 'Update Appointment' : 'Book Appointment'}
                </Button>
            </form>

            {selectedRoom && <RoomDetail room={roomDetail} onClose={() => setRoomDetail(null)} />}
            <ToastContainer />
        </Box>
    );
};

export default AppointmentForm;
