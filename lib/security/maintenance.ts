let maintenanceMode = false;

export function enableMaintenance() {
  maintenanceMode = true;
}

export function disableMaintenance() {
  maintenanceMode = false;
}

export function isMaintenanceEnabled() {
  return maintenanceMode;
}

export function maintenanceResponse() {
  return {
    success: false,
    status: 503,
    message: "System is currently under maintenance.",
  };
}