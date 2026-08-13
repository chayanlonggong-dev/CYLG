import {
  NextRequest,
  NextResponse,
} from "next/server";

import cloudinary from "@/lib/cloudinary";

import {
  requireAdminSession,
} from "@/lib/auth/session";

import {
  rateLimit,
} from "@/lib/rateLimit";

import {
  createAuditLog,
} from "@/lib/audit/audit";

import {
  createUploadErrorResponse,
  hasUnsafePathTraversal,
  isAllowedExtension,
  isDangerousFile,
  logUploadEvent,
  sanitizeUploadFilename,
} from "@/lib/upload";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/gif",
];

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "ico",
  "gif",
];

export async function POST(
  request: NextRequest
) {
  let sanitizedFileName = "unknown";
  let fileSize = 0;

  try {
    const session = await requireAdminSession();

    const ip =
      request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() || "unknown";

    const rate = rateLimit(
      `favicon-upload:${ip}`,
      {
        limit: 10,
        windowMs: 60 * 1000,
      }
    );

    if (!rate.success) {
      logUploadEvent({
        uploadType: "favicon",
        filename: sanitizedFileName,
        size: fileSize,
        success: false,
      });

      return NextResponse.json(
        createUploadErrorResponse(
          "Too many upload requests."
        ),
        {
          status: 429,
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      logUploadEvent({
        uploadType: "favicon",
        filename: sanitizedFileName,
        size: fileSize,
        success: false,
      });

      return NextResponse.json(
        createUploadErrorResponse(
          "No file uploaded."
        ),
        {
          status: 400,
        }
      );
    }

    sanitizedFileName = sanitizeUploadFilename(file.name);
    fileSize = file.size;

    // .ico 的 MIME 有时为空或不在常见列表，按扩展名放行
    const isIco =
      sanitizedFileName.toLowerCase().endsWith(".ico") ||
      file.type === "image/x-icon" ||
      file.type === "image/vnd.microsoft.icon";

    if (
      hasUnsafePathTraversal(file.name) ||
      hasUnsafePathTraversal(sanitizedFileName) ||
      (
        !isIco &&
        (
          isDangerousFile(
            sanitizedFileName,
            file.type,
            ALLOWED_TYPES
          ) ||
          !isAllowedExtension(
            sanitizedFileName,
            ALLOWED_EXTENSIONS
          )
        )
      ) ||
      (
        isIco &&
        !isAllowedExtension(
          sanitizedFileName,
          ALLOWED_EXTENSIONS
        )
      )
    ) {
      logUploadEvent({
        uploadType: "favicon",
        filename: sanitizedFileName,
        size: fileSize,
        success: false,
      });

      return NextResponse.json(
        createUploadErrorResponse(
          "Invalid file type."
        ),
        {
          status: 400,
        }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      logUploadEvent({
        uploadType: "favicon",
        filename: sanitizedFileName,
        size: fileSize,
        success: false,
      });

      return NextResponse.json(
        createUploadErrorResponse(
          "File size exceeds 10MB."
        ),
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{
      secure_url: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "cylg/favicon",
            resource_type: "image",
            transformation: [
              {
                quality: "auto",
              },
              {
                fetch_format: "auto",
              },
            ],
          },
          (error, result) => {
            if (error || !result) {
              reject(
                error ||
                  new Error("Cloudinary upload failed.")
              );
            } else {
              resolve(
                result as { secure_url: string }
              );
            }
          }
        )
        .end(buffer);
    });

    createAuditLog({
      action: "UPLOAD",
      entity: "Favicon",
      userId: String(session.adminUserId),
      description: "Admin uploaded website favicon.",
      metadata: {
        ip,
        fileName: sanitizedFileName,
      },
    });

    logUploadEvent({
      uploadType: "favicon",
      filename: sanitizedFileName,
      size: fileSize,
      success: true,
    });

    return NextResponse.json(
      {
        success: true,
        url: uploadResult.secure_url,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);

    logUploadEvent({
      uploadType: "favicon",
      filename: sanitizedFileName,
      size: fileSize,
      success: false,
    });

    return NextResponse.json(
      createUploadErrorResponse(
        "Upload failed."
      ),
      {
        status: 500,
      }
    );
  }
}