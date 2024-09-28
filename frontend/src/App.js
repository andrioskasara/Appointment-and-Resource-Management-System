import './App.css';
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import AppointmentList from "./components/booking/AppointmentList";
import ResourceList from "./components/resources/ResourceList";
import RoomList from "./components/rooms/RoomList";
import {AuthProvider} from "./context/AuthContext";
import {UserProvider} from "./context/UserContext";
import Navbar from "./components/common/Navbar";
import PrivateRoute from "./components/common/PrivateRoute";
import AdminRoute from "./components/common/AdminRoute";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import ResourceManagement from "./components/admin/ResourceManagement";
import RoomManagement from "./components/admin/RoomManagement";
import EditAppointmentForm from "./components/booking/EditAppointmentForm";
import BookingForm from "./components/booking/BookingForm";
import CalendarPage from "./pages/CalendarPage";

const theme = createTheme({
    palette: {
        primary: {
            main: '#003366',
        },
        secondary: {
            main: '#708090',
        },
    },
});

const App = () => (
    <ThemeProvider theme={theme}>
        <CssBaseline/>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AuthProvider>
                <UserProvider>
                    <Router>
                        <Navbar/>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/"
                                element={
                                    <PrivateRoute>
                                        <DashboardPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/appointments"
                                element={
                                    <PrivateRoute>
                                        <AppointmentList />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/appointments/new"
                                element={
                                    <PrivateRoute>
                                        <BookingForm/>
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/appointments/edit/:id"
                                element={
                                    <PrivateRoute>
                                        <EditAppointmentForm />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/resources"
                                element={
                                    <PrivateRoute>
                                        <ResourceList />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/rooms"
                                element={
                                    <PrivateRoute>
                                        <RoomList />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/calendar"
                                element={
                                    <PrivateRoute>
                                        <CalendarPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/admin/*"
                                element={
                                    <PrivateRoute>
                                        <AdminRoute>
                                            <Routes>
                                                <Route path="/" element={<AdminPage />} />
                                                <Route path="resources" element={<ResourceManagement />} />
                                                <Route path="rooms" element={<RoomManagement />} />
                                            </Routes>
                                        </AdminRoute>
                                    </PrivateRoute>
                                }
                            />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Router>
                </UserProvider>
            </AuthProvider>
        </LocalizationProvider>
    </ThemeProvider>
);

export default App;
