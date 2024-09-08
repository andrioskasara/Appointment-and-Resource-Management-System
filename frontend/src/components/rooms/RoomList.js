import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Stack } from '@mui/material';
import {getRooms} from "../../api/services/roomService";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomData = await getRooms();
        setRooms(roomData);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        setError('Failed to fetch rooms');
      }
    };

    fetchRooms().catch((err) => {
      console.error('Unexpected error:', err);
    });
  }, []);

  return (
      <Container>
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4">Rooms</Typography>
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
                        <TableCell>Name</TableCell>
                        <TableCell>Capacity</TableCell>
                        <TableCell>Fixed Resources</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rooms.map((room) => (
                          <TableRow key={room.id}>
                            <TableCell>{room.name}</TableCell>
                            <TableCell>{room.capacity}</TableCell>
                            <TableCell>
                              {room.fixed_resources.map(resource => resource.name).join(', ')}
                            </TableCell>
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

export default RoomList;
