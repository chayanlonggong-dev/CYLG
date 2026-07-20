export type Permission =
  | "MODEL_CREATE"
  | "MODEL_UPDATE"
  | "MODEL_DELETE"
  | "MODEL_VIEW"
  | "SETTINGS_UPDATE"
  | "ADMIN_VIEW"
  | "ADMIN_MANAGE";

export type Role =
  | "OWNER"
  | "ADMIN"
  | "EDITOR"
  | "VIEWER";

const rolePermissions: Record<
  Role,
  Permission[]
> = {
  OWNER: [
    "MODEL_CREATE",
    "MODEL_UPDATE",
    "MODEL_DELETE",
    "MODEL_VIEW",
    "SETTINGS_UPDATE",
    "ADMIN_VIEW",
    "ADMIN_MANAGE",
  ],

  ADMIN: [
    "MODEL_CREATE",
    "MODEL_UPDATE",
    "MODEL_DELETE",
    "MODEL_VIEW",
    "SETTINGS_UPDATE",
    "ADMIN_VIEW",
  ],

  EDITOR: [
    "MODEL_CREATE",
    "MODEL_UPDATE",
    "MODEL_VIEW",
  ],

  VIEWER: [
    "MODEL_VIEW",
  ],
};

export function hasPermission(
  role: Role,
  permission: Permission
) {
  return rolePermissions[role].includes(
    permission
  );
}

export function getPermissions(
  role: Role
) {
  return [
    ...rolePermissions[role],
  ];
}

export function canAccess(
  role: Role,
  permissions: Permission[]
) {
  return permissions.every(
    (permission) =>
      hasPermission(
        role,
        permission
      )
  );
}

export function isValidRole(
  value: string
): value is Role {
  return [
    "OWNER",
    "ADMIN",
    "EDITOR",
    "VIEWER",
  ].includes(value);
}