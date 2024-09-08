import React, {useEffect, useState} from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    Stack,
    CircularProgress,
    TableContainer,
    Table,
    TableHead, TableCell, TableRow, TableBody, Paper
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {deleteAppointment, getAppointments} from "../../api/services/appointmentService";
import useUser from "../../hooks/useUser";
import {getRoom} from "../../api/services/roomService";
import {getAppointmentResources} from "../../api/services/appointmentResourceService";
import {getResource} from "../../api/services/resourceService";
import {getUser} from "../../api/services/userService";

// list the appointments the current user has created
// maybe we can have the current appointments (the ones that are booked in the future, that are not yet passed)
// the user can edit or delete this appointment
// but if the users edits the appointment (I think we will need to open the BookingForm with filled values),
// it should be handled well, in terms of availability
// (what if some other users booked the same room meanwhile, or maybe other user booked some of the resources that were
// available at that moment) (database)
// if the user deletes the appointment, make sure that the room is available again (in the database),
// also if some movable resources were booked here, we need to make sure that they are again available in the database
// we can maybe also show the passed (past) bookings (appointments) of the current user, of course with no way to edit
// or delete them, but is it possible to repeat them? - for this the user will need to adjust the time, and resources if
// some are unavailable - so if this is possible maybe on click we can open the BookingForm with some filled places
const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, loading: userLoading } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointments = async () => {
            if (user) {
                try {
                    let appointmentsData;

                    if (user.role === 'admin') {
                        appointmentsData = await getAppointments();
                    } else {
                        appointmentsData = await getAppointments(user.id);
                    }

                    const appointmentsWithDetails = await Promise.all(
                        appointmentsData.map(async (appointment) => {
                            const room = await getRoom(appointment.room_id);
                            const appointmentResources = await getAppointmentResources(appointment.id);

                            const resourceDetails = await Promise.all(
                                appointmentResources.map(async (ar) => {
                                    const resource = await getResource(ar.resource_id);
                                    return resource;
                                })
                            );

                            const appointmentUser = user.role === 'admin' ? await getUser(appointment.user_id) : null;

                            return {
                                ...appointment,
                                roomName: room?.name || 'Unknown Room',
                                resources: resourceDetails.map(r => r.name).join(', ') || 'None',
                                username: appointmentUser?.username || ''
                            };
                        })
                    );

                    setAppointments(appointmentsWithDetails);
                } catch (error) {
                    console.error('Failed to fetch appointments:', error);
                    setError('Failed to fetch appointments');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchAppointments().catch((error) => {
            console.error('Unexpected error:', error);
        });
    }, [user]);

    const handleDelete = async (id) => {
        if (!user) return;

        try {
            const appointment = appointments.find(a => a.id === id);
            // if (user.role === 'admin' || (appointment && appointment.user_id === user.id)) {
                await deleteAppointment(id);
                setAppointments(appointments.filter((appointment) => appointment.id !== id));
            // } else {
            //     alert('You do not have permission to delete this appointment.');
            // }
        } catch (error) {
            console.error('Failed to delete appointment:', error);
        }
    };

    const handleEditClick = (id) => {
        if (!user) return;

        const appointment = appointments.find(a => a.id === id);
        // if (user.role === 'admin' || (appointment && appointment.user_id === user.id)) {
            navigate(`/appointments/edit/${id}`);
        // } else {
        //     alert('You do not have permission to edit this appointment.');
        // }
    };

    if (userLoading || loading) return <CircularProgress />;

    return (
        <Container>
            <Box sx={{ mt: 8 }}>
                <Typography variant="h4">Appointments</Typography>
                {error ? (
                    <Typography variant="h6" color="error">
                        Error: {error}
                    </Typography>
                ) : (
                    <Stack spacing={2} sx={{ mt: 4 }}>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {user.role === 'admin' && <TableCell>Username</TableCell>}
                                        <TableCell>Room</TableCell>
                                        <TableCell>Start Time</TableCell>
                                        <TableCell>End Time</TableCell>
                                        <TableCell>Resources</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {appointments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={user.role === 'admin' ? 6 : 5}>No appointments found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        appointments.map((appointment) => (
                                            <TableRow key={appointment.id}>
                                                {user.role === 'admin' && <TableCell>{appointment.username}</TableCell>}
                                                <TableCell>{appointment.roomName}</TableCell>
                                                <TableCell>{new Date(appointment.start_time).toLocaleString()}</TableCell>
                                                <TableCell>{new Date(appointment.end_time).toLocaleString()}</TableCell>
                                                <TableCell>{appointment.resources}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleEditClick(appointment.id)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        onClick={() => handleDelete(appointment.id)}
                                                        sx={{ ml: 2 }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                )}
            </Box>
        </Container>
    );
};

export default AppointmentList;