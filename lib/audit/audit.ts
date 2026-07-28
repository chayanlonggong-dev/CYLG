import {
  prisma,
} from "@/lib/prisma";



export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "UPLOAD"
  | "SETTINGS_CHANGE";



export interface AuditLog {

  id: string;

  action: AuditAction;

  entity?: string;

  entityId?: string | number;

  userId?: string;

  description: string;

  metadata?: Record<string, unknown>;

  createdAt: Date;

}





function serializeMetadata(
  metadata?: Record<string, unknown>
) {

  if (!metadata) {

    return null;

  }


  return JSON.stringify(
    metadata
  );

}







export async function createAuditLog(

  data: Omit<
    AuditLog,
    "id" | "createdAt"
  >

) {


  const log =

    await prisma.auditLog.create({

      data: {

        action:
          data.action,


        entity:
          data.entity ?? null,


        entityId:
          data.entityId
          ?
          String(data.entityId)
          :
          null,


        userId:
          data.userId ?? null,


        description:
          data.description,


        metadata:
          serializeMetadata(
            data.metadata
          ),

      },

    });





  return {

    ...log,

    metadata:

      log.metadata

      ?

      JSON.parse(
        log.metadata
      )

      :

      undefined,

  };

}








export async function getAuditLogs(

  options?: {

    limit?: number;

    skip?: number;

    action?: AuditAction;

    userId?: string;

    entity?: string;

  }

) {


  const logs =

    await prisma.auditLog.findMany({

      where: {

        action:
          options?.action,


        userId:
          options?.userId,


        entity:
          options?.entity,

      },


      orderBy: {

        createdAt:
          "desc",

      },


      take:

        options?.limit
        ??
        50,


      skip:

        options?.skip
        ??
        0,


    });





  return logs.map(

  (log: {
    id: string;
    action: string;
    entity: string | null;
    entityId: string | null;
    userId: string | null;
    description: string;
    metadata: string | null;
    createdAt: Date;
    }) => ({

    ...log,

    metadata:

      log.metadata

      ?

      JSON.parse(
        log.metadata
      )

      :

      undefined,

  })

);

}








export async function getAuditLogsByUser(

  userId: string

) {


  return prisma.auditLog.findMany({

    where: {

      userId,

    },


    orderBy: {

      createdAt:
        "desc",

    },

  });

}








export async function getAuditLogsByEntity(

  entity: string,

  entityId?: string | number

) {


  return prisma.auditLog.findMany({

    where: {

      entity,


      entityId:

        entityId

        ?

        String(entityId)

        :

        undefined,

    },


    orderBy: {

      createdAt:
        "desc",

    },

  });

}








export async function clearAuditLogs() {


  return prisma.auditLog.deleteMany({});

}








export async function countAuditLogs(

  action?: AuditAction

) {


  if (!action) {


    return prisma.auditLog.count();


  }





  return prisma.auditLog.count({

    where: {

      action,

    },

  });

}