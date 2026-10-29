from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    workspaces,
    vehicles,
    documents,
    renewals,
    drivers,
    operations,
    dashboard
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health & Reference"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["Workspaces"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(renewals.router, prefix="/renewals", tags=["Renewals"])
api_router.include_router(drivers.router, prefix="/drivers", tags=["Drivers"])
api_router.include_router(operations.router, prefix="/operations", tags=["Operations"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
