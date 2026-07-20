const whitelist = new Set<string>();

export function addAdminIp(ip: string) {
  whitelist.add(ip.trim());
}

export function removeAdminIp(ip: string) {
  whitelist.delete(ip.trim());
}

export function clearAdminWhitelist() {
  whitelist.clear();
}

export function getAdminWhitelist() {
  return Array.from(whitelist);
}

export function isAdminIpAllowed(ip: string) {
  if (whitelist.size === 0) {
    return true;
  }

  return whitelist.has(ip.trim());
}