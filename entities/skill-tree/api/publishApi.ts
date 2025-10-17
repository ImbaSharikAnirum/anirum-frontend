import type { Node, Edge } from '@xyflow/react';
import type { SkillTree } from '../model/types';
import { skillTreeAPI } from './skillTreeApi';

export interface PublishProgress {
  phase: 'preparing' | 'uploading' | 'complete';
  current: number;
  total: number;
  status: string;
}

export interface PublishResult {
  success: boolean;
  tree?: SkillTree;
  error?: string;
  skillIdMap?: Record<string, string>; // temp ID -> real documentId
  guideIdMap?: Record<string, string>; // temp ID -> real documentId
}

/**
 * Данные гайда для публикации
 */
interface GuidePublishData {
  documentId?: string;
  tempId?: string;
  title: string;
  text?: string;
  link?: string;
  image?: string; // base64 или URL
  skillId: string; // К какому навыку относится гайд
}

/**
 * Данные навыка для публикации с guideEdges
 */
interface SkillPublishData {
  documentId?: string;
  tempId?: string;
  title: string;
  position: { x: number; y: number };
  image?: string;
  guideEdges?: Array<{ id: string; source: string; target: string; type?: string }>;
}

/**
 * Публикация изменений дерева навыков с гайдами на сервер
 * Использует batch endpoint - один запрос для всех изменений
 */
export async function publishSkillTree(
  treeId: string,
  apiTree: SkillTree,
  localNodes: Node[],
  localEdges: Edge[],
  onProgress?: (progress: PublishProgress) => void,
  // Опциональные параметры для публикации гайдов конкретного навыка
  skillId?: string,
  skillGuideNodes?: Node[],
  skillGuideEdges?: Edge[]
): Promise<PublishResult> {
  try {
    // ФАЗА 1: Подготовка данных
    onProgress?.({
      phase: 'preparing',
      current: 1,
      total: 3,
      status: 'Подготовка данных для публикации...',
    });

    const skillNodes = localNodes.filter(node => node.type === 'skill');

    // Формируем массив навыков для batch запроса
    const skills: SkillPublishData[] = skillNodes.map(node => {
      const existingSkill = apiTree.skills?.find(s => s.documentId === node.id);

      const skillData: SkillPublishData = {
        documentId: existingSkill ? node.id : undefined,
        tempId: existingSkill ? undefined : node.id,
        title: node.data.label as string,
        position: node.position,
        image: node.data.thumbnail as string | undefined, // base64 или URL
      };

      return skillData;
    });

    // Определяем удаленные навыки
    const currentSkillIds = new Set(skillNodes.map(n => n.id));
    const deletedSkills = apiTree.skills
      ?.filter(s => !currentSkillIds.has(s.documentId))
      .map(s => s.documentId) || [];

    // Формируем связи между навыками
    const skillEdges = localEdges.map((edge: Edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
    }));

    // Формируем массив гайдов (если передан skillId)
    let guides: GuidePublishData[] = [];
    if (skillId && skillGuideNodes && skillGuideEdges) {
      const guideNodes = skillGuideNodes.filter(node => node.type === 'guide');
      const existingSkill = apiTree.skills?.find(s => s.documentId === skillId);

      guides = guideNodes.map(node => {
        const existingGuide = existingSkill?.guides?.find(g => g.documentId === node.id);

        return {
          documentId: existingGuide ? node.id : undefined,
          tempId: existingGuide ? undefined : node.id,
          title: node.data.title as string,
          text: node.data.text as string | undefined,
          link: node.data.link as string | undefined,
          image: node.data.thumbnail as string | undefined,
          skillId: skillId,
        };
      });

      // Добавляем guideEdges к соответствующему навыку
      const skillIndex = skills.findIndex(s => s.documentId === skillId || s.tempId === skillId);
      if (skillIndex !== -1) {
        skills[skillIndex].guideEdges = skillGuideEdges.map((edge: Edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
        }));
      }
    }

    // ФАЗА 2: Отправка batch запроса
    onProgress?.({
      phase: 'uploading',
      current: 2,
      total: 3,
      status: 'Сохранение изменений на сервер...',
    });

    const response = await fetch(`/api/skill-trees/${treeId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills,
        skillEdges,
        deletedSkills,
        guides,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Ошибка публикации');
    }

    const result = await response.json();

    // ФАЗА 3: Завершение
    onProgress?.({
      phase: 'complete',
      current: 3,
      total: 3,
      status: 'Публикация завершена!',
    });

    return {
      success: true,
      tree: result.data,
      skillIdMap: result.meta?.skillIdMap,
      guideIdMap: result.meta?.guideIdMap,
    };
  } catch (error) {
    console.error('Ошибка публикации:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}

/**
 * Проверка конфликтов перед публикацией
 */
export async function checkPublishConflicts(
  treeId: string,
  localUpdatedAt: string
): Promise<boolean> {
  try {
    const serverTree = await skillTreeAPI.getSkillTree(treeId);
    return serverTree.updatedAt === localUpdatedAt;
  } catch {
    return false;
  }
}
