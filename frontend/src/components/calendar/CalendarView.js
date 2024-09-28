import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CircularProgress, Typography, Box, Button, Popover } from '@mui/material';
import useUser from "../../hooks/useUser";
import { getAppointments } from "../../api/services/appointmentService";
import { getRoom } from "../../api/services/roomService";
import { getAppointmentResources } from "../../api/services/appointmentResourceService";
import { getResource } from "../../api/services/resourceService";
import { getUser } from "../../api/services/userService";
import { format, parseISO } from 'date-fns';

const CalendarView = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverContent, setPopoverContent] = useState({
        room: '',
        movableResources: '',
        fixedResources: [],
        username: '',
        dateTime: ''
    });
    const [viewAll, setViewAll] = useState(false);
    const { user, loading: userLoading } = useUser();

    const formatAppointmentDate = (start, end) => {
        const startDate = parseISO(start);
        const endDate = parseISO(end);

        return `${format(startDate, "EEE, MMMM d, h:mm a")} – ${format(endDate, "h:mm a")}`;
    };

    useEffect(() => {
        const fetchAppointments = async () => {
            if (user) {
                try {
                    let appointmentsData;

                    if (user.role === 'admin' || viewAll) {
                        appointmentsData = await getAppointments();
                    } else {
                        appointmentsData = await getAppointments(user.id);
                    }

                    const appointmentsWithDetails = await Promise.all(
                        (appointmentsData || []).map(async (appointment) => {
                            const room = await getRoom(appointment.room_id);
                            const appointmentResources = await getAppointmentResources(appointment.id);

                            const resourceDetails = await Promise.all(
                                (appointmentResources || []).map(async (ar) => {
                                    const resource = await getResource(ar.resource_id);
                                    return resource || {};
                                })
                            );

                            const appointmentUser = user.role === 'admin' || viewAll ? await getUser(appointment.user_id) : null;

                            return {
                                ...appointment,
                                roomName: room?.name || 'Unknown Room',
                                fixedResources: room?.fixed_resources || [],
                                movableResources: resourceDetails.map(r => r.name).join(', ') || 'None',
                                username: appointmentUser?.username || ''
                            };
                        })
                    );

                    setAppointments(appointmentsWithDetails);
                } catch (error) {
                    console.error('Failed to fetch appointments:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchAppointments().catch((error) => {
            console.error('Unexpected error:', error);
        });
    }, [user, viewAll]);

    if (userLoading || loading) return <CircularProgress />;

    const handleEventClick = (info) => {
        const { room, movableResources, fixedResources, username, start, end } = info.event.extendedProps;

        setPopoverContent({
            room: room || 'Unknown Room',
            movableResources: movableResources || 'None',
            fixedResources: fixedResources || [],
            username: username || '',
            dateTime: formatAppointmentDate(start, end)
        });
        setAnchorEl(info.el);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const events = (appointments || []).map((appointment) => ({
        id: appointment.id,
        title: appointment.roomName,
        start: appointment.start_time,
        end: appointment.end_time,
        extendedProps: {
            room: appointment.roomName,
            movableResources: appointment.movableResources,
            fixedResources: appointment.fixedResources,
            username: appointment.username,
            start: appointment.start_time,
            end: appointment.end_time,
        },
    }));

    return (
        <Box sx={{ mt: 4, px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" gutterBottom>
                    {user.role === 'admin' ? 'All Appointments' : (viewAll ? 'All Appointments' : 'My Appointments')}
                </Typography>

                {user.role !== 'admin' && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setViewAll(!viewAll)}
                    >
                        {viewAll ? 'View My Appointments' : 'View All Appointments'}
                    </Button>
                )}
            </Box>

            <Box sx={{ height: '80vh', overflow: 'hidden', width: 'calc(100% - 32px)', mx: 'auto' }}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    events={events}
                    editable={false}
                    selectable={true}
                    eventClick={handleEventClick}
                    height="100%"
                />

                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    sx={{ width: 'auto' }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1, whiteSpace: 'nowrap' }}>Appointment Details</Typography>
                        <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'nowrap' }}>
                            <strong>Room:</strong> {popoverContent.room}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'nowrap' }}>
                            <strong>Fixed Resources:</strong> {popoverContent.fixedResources.length > 0 ? (
                            popoverContent.fixedResources.map((resource, index) => (
                                <span key={index}>{resource.name || 'Unnamed Resource'}{index < popoverContent.fixedResources.length - 1 ? ', ' : ''}</span>
                            ))
                        ) : 'None'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'nowrap' }}>
                            <strong>Movable Resources:</strong> {popoverContent.movableResources}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'nowrap' }}>
                            <strong>Date & Time:</strong> {popoverContent.dateTime}
                        </Typography>
                        {(user.role === 'admin' || viewAll) && (
                            <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'nowrap' }}>
                                <strong>User:</strong> {popoverContent.username}
                            </Typography>
                        )}
                    </Box>
                </Popover>
            </Box>
        </Box>
    );
};

export default CalendarView;
