import { prisma } from "@/lib/prisma";

export async function restoreModels(models: any[]) {
  if (!Array.isArray(models)) {
    return {
      success: false,
      message: "Invalid models data.",
    };
  }

  try {
    // 清空现有 Model
    await prisma.model.deleteMany();

    // 没有资料就结束
    if (models.length === 0) {
      return {
        success: true,
        restored: 0,
      };
    }

    // 重新建立所有 Model
    await prisma.model.createMany({
      data: models.map((model) => ({
        level: model.level,
        number: model.number,
        code: model.code,

        title: model.title ?? "",
        nationality: model.nationality ?? "",
        city: model.city ?? "",

        age: model.age ?? 18,
        height: model.height ?? 160,
        weight: model.weight ?? 50,

        languages: model.languages ?? "",
        services: model.services ?? "",

        avatar: model.avatar ?? "",
        gallery: model.gallery ?? "",
        videos: model.videos ?? "",

        introduction: model.introduction ?? "",

        online: model.online ?? true,
        featured: model.featured ?? false,

        createdAt: model.createdAt
          ? new Date(model.createdAt)
          : new Date(),

        updatedAt: model.updatedAt
          ? new Date(model.updatedAt)
          : new Date(),
      })),
    });

    return {
      success: true,
      restored: models.length,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to restore models.",
    };
  }
}