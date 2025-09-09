import { BaseAPI } from "@/shared/api/base";
import { Course, CreateCourseData, UpdateCourseData } from "../model/types";
import { convertToMoscow } from "@/shared/lib/timezone";

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

interface PriceStats {
  min: number;
  max: number;
  histogram: { priceRange: [number, number]; count: number }[];
}

export class CourseAPI extends BaseAPI {
  /**
   * Получение списка курсов с фильтрацией и пагинацией
   */
  async getCourses(params?: {
    page?: number;
    pageSize?: number;
    sort?: string[];
    filters?: Record<string, any>;
    populate?: (string | { path: string; filters?: Record<string, any> })[];
    withCount?: boolean;
    invoicesMonth?: number;
    invoicesYear?: number;
  }): Promise<{ courses: Course[]; meta: any }> {
    const searchParams = new URLSearchParams();

    // Пагинация
    if (params?.page)
      searchParams.append("pagination[page]", params.page.toString());
    if (params?.pageSize)
      searchParams.append("pagination[pageSize]", params.pageSize.toString());

    // Сортировка
    if (params?.sort) {
      params.sort.forEach((sortField, index) => {
        searchParams.append(`sort[${index}]`, sortField);
      });
    }

    // Фильтры
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Специальная обработка для $or массивов
          if (key === "$or" && Array.isArray(value)) {
            value.forEach((orCondition, index) => {
              Object.entries(orCondition).forEach(([field, fieldValue]) => {
                if (typeof fieldValue === "object" && fieldValue !== null) {
                  Object.entries(fieldValue).forEach(([operator, operatorValue]) => {
                    if (operatorValue !== null && operatorValue !== undefined) {
                      searchParams.append(
                        `filters[$or][${index}][${field}][${operator}]`,
                        String(operatorValue)
                      );
                    }
                  });
                }
              });
            });
          }
          // Специальная обработка для других сложных фильтров
          else if (typeof value === "object") {
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (typeof nestedValue === "object" && nestedValue) {
                // Для сложных фильтров типа teacher: { documentId: { $eq: 'value' } }
                Object.entries(nestedValue).forEach(
                  ([operator, operatorValue]) => {
                    if (operatorValue != null) {
                      searchParams.append(
                        `filters[${key}][${nestedKey}][${operator}]`,
                        String(operatorValue)
                      );
                    }
                  }
                );
              } else if (nestedValue != null) {
                // Для простых операторов типа pricePerLesson: { $gte: 200, $lte: 10000 }
                searchParams.append(
                  `filters[${key}][${nestedKey}]`,
                  String(nestedValue)
                );
              }
            });
          } else {
            // Для простых фильтров
            const stringValue =
              typeof value === "boolean" ? value.toString() : value.toString();
            searchParams.append(`filters[${key}][$eq]`, stringValue);
          }
        }
      });
    }

    // Популяция связанных данных (изображения, преподаватель, инвойсы)
    const populate = params?.populate || ["images", "teacher.avatar"];
    
    // Проверяем, нужно ли фильтровать инвойсы
    const needInvoicesFilter = params?.populate?.includes('invoices') && (params?.invoicesMonth || params?.invoicesYear);
    
    if (needInvoicesFilter) {
      // Если нужна фильтрация инвойсов, используем объектный синтаксис populate
      const year = params.invoicesYear || new Date().getFullYear();
      const month = params.invoicesMonth || new Date().getMonth() + 1;
      
      // Формируем диапазон дат для месяца
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

      // Обрабатываем каждый populate отдельно
      populate.forEach((field) => {
        if (typeof field === 'string') {
          if (field === 'invoices') {
            // Для инвойсов добавляем фильтрацию
            searchParams.append(`populate[invoices][filters][startDate][$gte]`, startDate);
            searchParams.append(`populate[invoices][filters][startDate][$lte]`, endDate);
          } else if (field === 'teacher.avatar') {
            // Для вложенных полей используем правильный синтаксис
            searchParams.append(`populate[teacher][populate][avatar]`, 'true');
          } else if (field === 'images') {
            // Для media полей простое populate
            searchParams.append(`populate[images]`, 'true');
          } else {
            // Для остальных полей простое populate
            searchParams.append(`populate[${field}]`, 'true');
          }
        }
      });
    } else {
      // Простое populate без фильтров
      populate.forEach((field, index) => {
        if (typeof field === 'string') {
          searchParams.append(`populate[${index}]`, field);
        } else if (typeof field === 'object' && field.path) {
          searchParams.append(`populate[${index}]`, field.path);
        }
      });
    }

    // Параметры invoicesMonth и invoicesYear теперь обрабатываются через populate фильтры выше

    // Включить count если запрошено
    if (params?.withCount) {
      searchParams.append("withCount", "true");
    }

    const queryString = searchParams.toString();
    const endpoint = `/courses?${queryString}`;

    const response = await this.request<StrapiResponse<Course>>(endpoint);

    return {
      courses: response.data,
      meta: response.meta,
    };
  }

  /**
   * Получение курса по documentId (Strapi 5)
   */
  async getCourse(
    documentId: string, 
    populate?: string[],
    filters?: {
      invoicesMonth?: number;
      invoicesYear?: number;
    }
  ): Promise<Course> {
    const searchParams = new URLSearchParams();

    const defaultPopulate = populate || ["teacher.avatar", "invoices"];
    
    // Проверяем, нужно ли фильтровать инвойсы
    const needInvoicesFilter = defaultPopulate.includes('invoices') && filters && (filters.invoicesMonth || filters.invoicesYear);
    
    if (needInvoicesFilter) {
      // Если нужна фильтрация инвойсов, используем объектный синтаксис populate
      const year = filters.invoicesYear || new Date().getFullYear();
      const month = filters.invoicesMonth || new Date().getMonth() + 1;
      
      // Формируем диапазон дат для месяца
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

      // Обрабатываем каждый populate отдельно
      defaultPopulate.forEach((field) => {
        if (typeof field === 'string') {
          if (field === 'invoices') {
            // Для инвойсов добавляем фильтрацию
            searchParams.append(`populate[invoices][filters][startDate][$gte]`, startDate);
            searchParams.append(`populate[invoices][filters][startDate][$lte]`, endDate);
          } else if (field === 'teacher.avatar') {
            // Для вложенных полей используем правильный синтаксис
            searchParams.append(`populate[teacher][populate][avatar]`, 'true');
          } else if (field === 'images') {
            // Для media полей простое populate
            searchParams.append(`populate[images]`, 'true');
          } else {
            // Для остальных полей простое populate
            searchParams.append(`populate[${field}]`, 'true');
          }
        }
      });
    } else {
      // Простое populate без фильтров
      defaultPopulate.forEach((field, index) => {
        if (typeof field === 'string') {
          searchParams.append(`populate[${index}]`, field);
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/courses/${documentId}?${queryString}`;

    const response = await this.request<StrapiSingleResponse<Course>>(endpoint);
    return response.data;
  }

  /**
   * Загрузка изображений через Next.js API route
   */
  async uploadImages(files: File[]): Promise<number[]> {
    if (files.length === 0) return [];

    const form = new FormData();
    files.forEach((file) => {
      form.append("files", file, file.name);
    });

    const response = await fetch('/api/upload', {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      throw new Error("Ошибка при загрузке изображений");
    }

    const uploadedFiles = await response.json();
    return uploadedFiles.map((file: any) => file.id);
  }

  /**
   * Создание курса
   */
  async createCourse(
    formData: CreateCourseData,
    selectedDays: string[],
    imageFiles?: File[]
  ): Promise<Course> {
    // Шаг 1: Загрузить изображения (если есть)
    let imageIds: number[] = [];
    if (imageFiles && imageFiles.length > 0) {
      imageIds = await this.uploadImages(imageFiles);
    }

    // Шаг 2: Вычислить нормализованное время в московской зоне
    const normalizedStartTime =
      formData.startTime && formData.timezone
        ? convertToMoscow(formData.startTime, formData.timezone)
        : null;
    const normalizedEndTime =
      formData.endTime && formData.timezone
        ? convertToMoscow(formData.endTime, formData.timezone)
        : null;

    // Шаг 3: Создать курс с привязанными изображениями
    const courseData = {
      data: {
        description: formData.description,
        direction: formData.direction,
        teacher: formData.teacher ? formData.teacher : null,
        startTime: formData.startTime ? `${formData.startTime}:00.000` : null,
        endTime: formData.endTime ? `${formData.endTime}:00.000` : null,
        normalizedStartTime,
        normalizedEndTime,
        startDate: formData.startDate
          ? formData.startDate.toISOString().split("T")[0]
          : null,
        endDate: formData.endDate
          ? formData.endDate.toISOString().split("T")[0]
          : null,
        timezone: formData.timezone,
        pricePerLesson: parseFloat(formData.pricePerLesson) || 0,
        currency: formData.currency,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        isOnline: formData.isOnline ?? false,
        minStudents: formData.minStudents,
        maxStudents: formData.maxStudents,
        startAge: parseInt(formData.startAge) || null,
        endAge: parseInt(formData.endAge) || null,
        complexity: formData.complexity,
        courseType: formData.courseType,
        language: formData.language,
        inventoryRequired: formData.inventoryRequired,
        inventoryDescription: formData.inventoryDescription,
        rentalPrice: parseFloat(formData.rentalPrice) || null,
        software: formData.software,
        urlMessenger: formData.urlMessenger,
        weekdays: selectedDays,
        googlePlaceId: formData.googlePlaceId,
        coordinates: formData.coordinates,
        images: imageIds, // Привязать загруженные изображения
      },
    };

    const response = await fetch('/api/courses', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Ошибка при создании курса');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Получение статистики цен для построения гистограммы
   */
  async getPriceStats(filters?: Record<string, any>): Promise<PriceStats> {
    const searchParams = new URLSearchParams();

    // Добавляем фильтры
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v, index) => {
            searchParams.append(`filters[${key}][${index}]`, v.toString());
          });
        } else if (typeof value === "object" && value !== null) {
          Object.entries(value).forEach(([op, opValue]) => {
            if (opValue != null) {
              searchParams.append(`filters[${key}][${op}]`, String(opValue));
            }
          });
        } else {
          searchParams.append(`filters[${key}]`, value.toString());
        }
      });
    }

    // Запрос всех курсов для построения статистики
    searchParams.append("pagination[pageSize]", "100");

    const response = await this.request<StrapiResponse<Course>>(
      `/courses?${searchParams.toString()}`
    );

    const prices = response.data
      .map((course) => course.pricePerLesson)
      .filter((price) => price != null && price > 0);

    if (prices.length === 0) {
      return {
        min: 0,
        max: 10000,
        histogram: [],
      };
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const tickCount = 30;
    const step = (max - min) / tickCount || 1; // Избегаем деления на ноль

    const histogram = Array(tickCount)
      .fill(0)
      .map((_, index) => {
        const rangeMin = min + index * step;
        const rangeMax = min + (index + 1) * step;
        const count = prices.filter(
          (price) => price >= rangeMin && price < rangeMax
        ).length;

        return {
          priceRange: [rangeMin, rangeMax] as [number, number],
          count,
        };
      });

    return { min, max, histogram };
  }

  /**
   * Обновление курса
   */
  async updateCourse(
    documentId: string,
    formData: UpdateCourseData,
    selectedDays: string[],
    imageFiles?: File[],
    allFiles?: any[] // Все файлы включая существующие для порядка
  ): Promise<Course> {
    // Шаг 1: Загрузить новые изображения (если есть)
    let newImageIds: number[] = [];
    if (imageFiles && imageFiles.length > 0) {
      newImageIds = await this.uploadImages(imageFiles);
    }
    
    // Шаг 2: Собрать все ID изображений в правильном порядке
    let finalImageIds: number[] = [];
    if (allFiles && allFiles.length > 0) {
      let newImageIndex = 0;
      
      finalImageIds = allFiles.map(fileWrapper => {
        const file = fileWrapper.file;
        
        // Если это новый загруженный файл (File object)
        if (file instanceof File) {
          return newImageIds[newImageIndex++];
        }
        // Если это существующее изображение (FileMetadata)
        else if (typeof file === 'object' && 'strapiId' in fileWrapper.file) {
          // Используем сохраненный Strapi ID
          return fileWrapper.file.strapiId;
        }
        
        return null;
      }).filter((id): id is number => id !== null);
    } else if (newImageIds.length > 0) {
      // Если allFiles не передан, используем только новые изображения
      finalImageIds = newImageIds;
    }

    // Шаг 3: Вычислить нормализованное время в московской зоне
    const normalizedStartTime =
      formData.startTime && formData.timezone
        ? convertToMoscow(formData.startTime, formData.timezone)
        : null;
    const normalizedEndTime =
      formData.endTime && formData.timezone
        ? convertToMoscow(formData.endTime, formData.timezone)
        : null;

    // Шаг 4: Подготовить данные для обновления
    const updateData = {
      data: {
        description: formData.description,
        direction: formData.direction,
        teacher: formData.teacher ? formData.teacher : null,
        startTime: formData.startTime ? `${formData.startTime}:00.000` : null,
        endTime: formData.endTime ? `${formData.endTime}:00.000` : null,
        normalizedStartTime,
        normalizedEndTime,
        startDate: formData.startDate
          ? formData.startDate.toISOString().split("T")[0]
          : null,
        endDate: formData.endDate
          ? formData.endDate.toISOString().split("T")[0]
          : null,
        timezone: formData.timezone,
        pricePerLesson: parseFloat(formData.pricePerLesson) || 0,
        currency: formData.currency,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        isOnline: formData.isOnline ?? false,
        minStudents: formData.minStudents,
        maxStudents: formData.maxStudents,
        startAge: parseInt(formData.startAge) || null,
        endAge: parseInt(formData.endAge) || null,
        complexity: formData.complexity,
        courseType: formData.courseType,
        language: formData.language,
        inventoryRequired: formData.inventoryRequired,
        inventoryDescription: formData.inventoryDescription,
        rentalPrice: parseFloat(formData.rentalPrice) || null,
        software: formData.software,
        urlMessenger: formData.urlMessenger,
        weekdays: selectedDays,
        googlePlaceId: formData.googlePlaceId,
        coordinates: formData.coordinates,
        // Если загружены новые изображения, заменяем их
        ...(finalImageIds.length > 0 && { images: finalImageIds }),
      },
    };

    const response = await fetch(`/api/courses/${documentId}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Ошибка при обновлении курса');
    }

    const result = await response.json();
    return result.data;
  }
}

// Экспортируем экземпляр API
export const courseAPI = new CourseAPI();
