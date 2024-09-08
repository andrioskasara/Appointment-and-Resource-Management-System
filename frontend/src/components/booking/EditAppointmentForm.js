import React from 'react';
import AppointmentForm from './AppointmentForm';
import { updateAppointment } from "../../api/services/appointmentService";
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointment } from "../../api/services/appointmentService";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";

const EditAppointmentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [appointmentData, setAppointmentData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const data = await getAppointment(id);
                setAppointmentData(data);
            } catch (error) {
                console.error('Error fetching appointment:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointment().catch(console.error);
    }, [id]);

    const handleSubmit = async (updatedData) => {
        try {
            await updateAppointment(id, updatedData);
            toast.success('Appointment updated successfully!');
            navigate('/appointments');
        } catch (error) {
            console.error('Failed to update appointment:', error);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <AppointmentForm
            appointmentData={appointmentData}
            onSubmit={handleSubmit}
            prepopulateFields
        />
    );
};

export default EditAppointmentForm;
