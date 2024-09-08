from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api import appointment_router, appointment_resource_router, resource_router, room_router, user_router
from backend.app.db.init_db import init_db

app = FastAPI()


@app.on_event("startup")
async def startup_event():
    await init_db()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(appointment_router.router,
                   prefix="/api/appointments",
                   tags=["Appointments"])
app.include_router(appointment_resource_router.router,
                   prefix="/api/appointment-resources",
                   tags=["Appointment Resources"])
app.include_router(resource_router.router,
                   prefix="/api/resources",
                   tags=["Resources"])
app.include_router(room_router.router,
                   prefix="/api/rooms",
                   tags=["Rooms"])
app.include_router(user_router.router,
                   prefix="/api/users",
                   tags=["Users"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
