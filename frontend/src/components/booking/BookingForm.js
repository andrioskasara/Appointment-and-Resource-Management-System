import React from 'react';
import AppointmentForm from './AppointmentForm';
import { createAppointment } from "../../api/services/appointmentService";
import { useNavigate } from 'react-router-dom';
import {toast} from "react-toastify";
import useUser from "../../hooks/useUser";

const BookingForm = () => {
    const navigate = useNavigate();
    const { user } = useUser();

    const handleSubmit = async (appointmentData) => {
        try {
            await createAppointment( {...appointmentData, user_id: user.id});
            toast.success('Appointment booked successfully!');
            navigate('/appointments');
        } catch (error) {
            console.error('Failed to book appointment:', error);
        }
    };

    return <AppointmentForm onSubmit={handleSubmit} />;
};

export default BookingForm;
