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
  id?: number; // Numeric ID для существующих гайдов
  documentId?: string; // Document ID для существующих гайдов из Strapi
  tempId?: string; // Временный ID для новых гайдов
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

    console.log('🔍 Анализ навыков:');
    console.log('🔍 localNodes:', localNodes.length);
    console.log('🔍 skillNodes:', skillNodes.length);
    console.log('🔍 apiTree.skills:', apiTree.skills?.length);

    // Если нет локальных навыков, используем навыки из API
    // (это происходит когда публикуем только гайды, без изменений дерева)
    const effectiveSkillNodes = skillNodes.length > 0
      ? skillNodes
      : (apiTree.skills || []).map(skill => ({
          id: skill.documentId,
          type: 'skill' as const,
          data: {
            label: skill.title,
            thumbnail: skill.image && typeof skill.image === 'object' ? skill.image.url : undefined,
            guideCount: skill.guides?.length || 0,
          },
          position: skill.position || { x: 0, y: 0 },
        }));

    console.log('🔍 effectiveSkillNodes:', effectiveSkillNodes.length);

    // Формируем массив навыков для batch запроса
    const skills: SkillPublishData[] = effectiveSkillNodes.map(node => {
      const existingSkill = apiTree.skills?.find(s => s.documentId === node.id);

      // Передаём изображение только если это base64 (новое или изменённое изображение)
      // Если это URL (http/https), значит изображение не менялось - не передаём его
      const thumbnail = node.data.thumbnail as string | undefined;
      const isBase64 = thumbnail && thumbnail.startsWith('data:image');

      const skillData: SkillPublishData = {
        documentId: existingSkill ? node.id : undefined,
        tempId: existingSkill ? undefined : node.id,
        title: node.data.label as string,
        position: node.position,
        image: isBase64 ? thumbnail : undefined, // Передаём только base64
      };

      return skillData;
    });

    // Определяем удаленные навыки (только если есть локальные изменения дерева)
    const currentSkillIds = new Set(effectiveSkillNodes.map(n => n.id));
    const deletedSkills = skillNodes.length > 0
      ? (apiTree.skills?.filter(s => !currentSkillIds.has(s.documentId)).map(s => s.documentId) || [])
      : []; // Если публикуем только гайды, не удаляем навыки

    console.log('🔍 currentSkillIds:', Array.from(currentSkillIds));
    console.log('🔍 deletedSkills:', deletedSkills);

    // Формируем связи между навыками
    const skillEdges = localEdges.map((edge: Edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
    }));

    // Формируем массив гайдов (если передан skillId)
    let guides: GuidePublishData[] = [];
    // Маппинг временных ID нод (node.id) на реальные documentId (node.data.guideId)
    const nodeIdToGuideDocId = new Map<string, string>();

    console.log('📊 Параметры для гайдов:');
    console.log('📊 skillId:', skillId);
    console.log('📊 skillGuideNodes:', skillGuideNodes?.length);
    console.log('📊 skillGuideEdges:', skillGuideEdges?.length);

    if (skillId && skillGuideNodes) {
      console.log('📊 Начало обработки гайдов для навыка:', skillId);
      console.log('📊 Всего guideNodes:', skillGuideNodes.length);

      const guideNodes = skillGuideNodes.filter(node => node.type === 'guide');
      const existingSkill = apiTree.skills?.find(s => s.documentId === skillId);

      console.log('📊 Гайды навыка из API:', existingSkill?.guides?.map(g => ({ id: g.documentId, title: g.title })));
      console.log('📊 Всего гайдов в API:', existingSkill?.guides?.length);

      guides = guideNodes.map(node => {
        // node.data.guideId содержит реальный documentId из Strapi (или временный ID для новых гайдов)
        const guideDocId = node.data.guideId as string;
        console.log(`📊 Обработка ноды ${node.id}:`);
        console.log(`   - node.data:`, node.data);
        console.log(`   - guideDocId: ${guideDocId}`);
        console.log(`   - title: ${node.data.title}`);

        const existingGuide = existingSkill?.guides?.find(g => g.documentId === guideDocId);
        console.log(`   - existingGuide: ${existingGuide ? 'найден' : 'НЕ найден'}`);

        // Сохраняем маппинг node.id -> guideDocId
        nodeIdToGuideDocId.set(node.id, guideDocId);

        // Передаём изображение только если это base64
        const thumbnail = node.data.thumbnail as string | undefined;
        const isBase64 = thumbnail && thumbnail.startsWith('data:image');

        // Проверяем, это новый гайд или существующий
        // Новые гайды имеют временный ID в формате "guide-{skillId}-{timestamp}" (строка)
        // Существующие гайды из сайдбара имеют guideDocId как numeric ID (число)
        const isNewGuide = typeof guideDocId === 'string' && guideDocId.startsWith('guide-');

        const guideData = {
          id: !isNewGuide && typeof guideDocId === 'number' ? guideDocId : undefined, // Numeric ID для существующих
          documentId: existingGuide ? existingGuide.documentId : undefined, // Document ID для существующих гайдов
          tempId: isNewGuide ? node.id : undefined, // Временный ID для новых гайдов
          title: node.data.title as string,
          text: node.data.text as string | undefined,
          link: node.data.link as string | undefined,
          image: isBase64 ? thumbnail : undefined,
          skillId: skillId,
        };

        console.log(`   - Финальные данные гайда:`, guideData);

        return guideData;
      });

      console.log('📊 Всего гайдов для отправки:', guides.length);

      // Добавляем guideEdges к соответствующему навыку (если есть связи)
      // Заменяем node.id на реальные documentId из guideId
      if (skillGuideEdges && skillGuideEdges.length > 0) {
        const skillIndex = skills.findIndex(s => s.documentId === skillId || s.tempId === skillId);
        if (skillIndex !== -1) {
          console.log('📊 Обработка guideEdges для навыка:', skillId);
          console.log('📊 Маппинг nodeId -> guideDocId:', Object.fromEntries(nodeIdToGuideDocId));
          console.log('📊 Исходные edges:', skillGuideEdges.map(e => ({ id: e.id, source: e.source, target: e.target })));

          skills[skillIndex].guideEdges = skillGuideEdges.map((edge: Edge) => {
            const mappedSource = nodeIdToGuideDocId.get(edge.source) || edge.source;
            const mappedTarget = nodeIdToGuideDocId.get(edge.target) || edge.target;

            console.log(`📊 Edge ${edge.id}: ${edge.source} -> ${mappedSource}, ${edge.target} -> ${mappedTarget}`);

            return {
              id: edge.id,
              source: mappedSource,
              target: mappedTarget,
              type: edge.type,
            };
          });

          console.log('📊 Финальные guideEdges:', skills[skillIndex].guideEdges);
        }
      }
    }

    // ФАЗА 2: Отправка batch запроса
    onProgress?.({
      phase: 'uploading',
      current: 2,
      total: 3,
      status: 'Сохранение изменений на сервер...',
    });

    console.log('🚀 Отправка данных на сервер:');
    console.log('🚀 Skills:', skills.map(s => ({ tempId: s.tempId, documentId: s.documentId, title: s.title })));
    console.log('🚀 SkillEdges:', skillEdges);
    console.log('🚀 DeletedSkills:', deletedSkills);
    console.log('🚀 Guides:', guides.map(g => ({ tempId: g.tempId, documentId: g.documentId, title: g.title, skillId: g.skillId })));

    // Используем числовой id для Strapi endpoint
    const numericId = apiTree.id;

    const payload = {
      skills,
      skillEdges,
      deletedSkills,
      guides,
    };

    console.log('🚀 Полный payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`/api/skill-trees/${numericId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
