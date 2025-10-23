import { BaseAPI } from "@/shared/api/base";
import {
  SkillTree,
  Skill,
  CreateSkillTreeData,
  UpdateSkillTreeData,
  CreateSkillData,
  UpdateSkillData,
} from "../model/types";

interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiSingleResponse<T> {
  data: T;
  meta: {};
}

export class SkillTreeAPI extends BaseAPI {
  /**
   * Получение списка деревьев навыков
   */
  async getSkillTrees(params?: {
    page?: number;
    pageSize?: number;
    populate?: string[];
  }): Promise<{ skillTrees: SkillTree[]; meta: any }> {
    const searchParams = new URLSearchParams();

    // Пагинация
    if (params?.page) {
      searchParams.append("pagination[page]", params.page.toString());
    }
    if (params?.pageSize) {
      searchParams.append("pagination[pageSize]", params.pageSize.toString());
    }

    // Популяция связанных данных (по умолчанию загружаем image и owner)
    const populate = params?.populate || ["image", "owner"];
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field);
    });

    const queryString = searchParams.toString();
    const endpoint = `/skill-trees?${queryString}`;

    const response = await this.request<StrapiResponse<SkillTree>>(endpoint);

    return {
      skillTrees: response.data,
      meta: response.meta,
    };
  }

  /**
   * Получение конкретного дерева навыков с навыками и связями
   */
  async getSkillTree(
    documentId: string,
    populate?: string[]
  ): Promise<SkillTree> {
    const searchParams = new URLSearchParams();

    // Популяция по умолчанию включает навыки с их изображениями, гайдами и связями
    // В Strapi 5 используем нотацию с точками для глубокой популяции
    const defaultPopulate = populate || [
      "image",
      "owner",
      "skills.image",
      "skills.guides.image",
    ];

    defaultPopulate.forEach((field) => {
      searchParams.append('populate', field);
    });

    // Получаем все гайды независимо от статуса публикации (draft + published)
    searchParams.append('publicationState', 'preview');

    const queryString = searchParams.toString();
    const endpoint = `/skill-trees/${documentId}?${queryString}`;

    const response = await this.request<StrapiSingleResponse<SkillTree>>(
      endpoint
    );
    return response.data;
  }

  /**
   * Создание нового дерева навыков
   */
  async createSkillTree(
    formData: CreateSkillTreeData
  ): Promise<SkillTree> {
    // Шаг 1: Загрузить изображение (если есть)
    let imageId: number | undefined;
    if (formData.image) {
      const uploadedImages = await this.uploadImage(formData.image);
      imageId = uploadedImages[0];
    }

    // Шаг 2: Создать дерево навыков
    const treeData = {
      data: {
        title: formData.title,
        description: formData.description || "",
        ...(imageId && { image: imageId }),
        skillEdges: [], // Изначально пустой массив связей
      },
    };

    const response = await fetch("/api/skill-trees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(treeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message || "Ошибка при создании дерева навыков"
      );
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Обновление дерева навыков
   */
  async updateSkillTree(
    documentId: string,
    formData: UpdateSkillTreeData
  ): Promise<SkillTree> {
    // Шаг 1: Загрузить новое изображение (если есть)
    let imageId: number | undefined;
    if (formData.image) {
      const uploadedImages = await this.uploadImage(formData.image);
      imageId = uploadedImages[0];
    }

    // Шаг 2: Подготовить данные для обновления
    const updateData = {
      data: {
        ...(formData.title && { title: formData.title }),
        ...(formData.description !== undefined && {
          description: formData.description,
        }),
        ...(formData.skillEdges && { skillEdges: formData.skillEdges }),
        ...(imageId && { image: imageId }),
      },
    };

    const response = await fetch(`/api/skill-trees/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message || "Ошибка при обновлении дерева навыков"
      );
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Удаление дерева навыков
   */
  async deleteSkillTree(documentId: string): Promise<void> {
    const response = await fetch(`/api/skill-trees/${documentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message || "Ошибка при удалении дерева навыков"
      );
    }
  }

  /**
   * Создание нового навыка в дереве
   */
  async createSkill(formData: CreateSkillData): Promise<Skill> {
    // Шаг 1: Загрузить изображение (если есть)
    let imageId: number | undefined;
    if (formData.image) {
      const uploadedImages = await this.uploadImage(formData.image);
      imageId = uploadedImages[0];
    }

    // Шаг 2: Создать навык
    const skillData = {
      data: {
        title: formData.title,
        position: formData.position,
        skill_tree: formData.skill_tree,
        ...(imageId && { image: imageId }),
        guideEdges: [], // Изначально пустой массив связей
      },
    };

    const response = await fetch("/api/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(skillData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Ошибка при создании навыка");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Обновление навыка
   */
  async updateSkill(
    documentId: string,
    formData: UpdateSkillData
  ): Promise<Skill> {
    // Шаг 1: Загрузить новое изображение (если есть)
    let imageId: number | undefined;
    if (formData.image) {
      const uploadedImages = await this.uploadImage(formData.image);
      imageId = uploadedImages[0];
    }

    // Шаг 2: Подготовить данные для обновления
    const updateData = {
      data: {
        ...(formData.title && { title: formData.title }),
        ...(formData.position && { position: formData.position }),
        ...(formData.guideEdges && { guideEdges: formData.guideEdges }),
        ...(imageId && { image: imageId }),
      },
    };

    const response = await fetch(`/api/skills/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Ошибка при обновлении навыка");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Удаление навыка
   */
  async deleteSkill(documentId: string): Promise<void> {
    const response = await fetch(`/api/skills/${documentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Ошибка при удалении навыка");
    }
  }

  /**
   * Загрузка изображения через Next.js API route
   * Публичный метод - используется в компонентах для загрузки изображений
   */
  async uploadImage(file: File): Promise<number[]> {
    const form = new FormData();
    form.append("files", file, file.name);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      throw new Error("Ошибка при загрузке изображения");
    }

    const uploadedFiles = await response.json();
    return uploadedFiles.map((file: any) => file.id);
  }
}

// Экспортируем экземпляр API
export const skillTreeAPI = new SkillTreeAPI();
