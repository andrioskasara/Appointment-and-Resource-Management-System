import React from 'react';
import AppointmentForm from './AppointmentForm';
import { createAppointment } from "../../api/services/appointmentService";
import { useNavigate } from 'react-router-dom';
import {toast} from "react-toastify";

const BookingForm = () => {
    const navigate = useNavigate();

    const handleSubmit = async (appointmentData) => {
        try {
            await createAppointment(appointmentData);
            toast.success('Appointment booked successfully!');
            navigate('/appointments');
        } catch (error) {
            console.error('Failed to book appointment:', error);
        }
    };

    return <AppointmentForm onSubmit={handleSubmit} />;
};

export default BookingForm;
