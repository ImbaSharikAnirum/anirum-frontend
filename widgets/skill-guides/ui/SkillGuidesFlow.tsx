'use client'

import { ReactFlow, Background, Controls, MiniMap, Node, Edge, NodeTypes, useNodesState, useEdgesState, Panel, ConnectionMode, addEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { GuideNode } from '@/shared/ui'
import { useCallback, useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { CreateGuideDialog } from '@/features/guide-create'

const nodeTypes: NodeTypes = {
  guide: GuideNode as any,
}

export interface SkillGuidesFlowRef {
  addGuide: (guideData: { id: string; numericId?: number; title: string; thumbnail?: string }) => void
}

export interface ApiGuide {
  documentId: string
  id: number
  title: string
  image?: {
    url: string
    formats?: {
      thumbnail?: {
        url: string
      }
    }
  }
}

interface SkillGuidesFlowProps {
  skillId: string
  skillData?: {
    label: string
    color: string
  }
  onItemSelect: (item: { type: 'guide'; title: string; thumbnail?: string } | null) => void
  mode?: 'view' | 'edit'
  onDelete?: () => void
  apiGuides?: ApiGuide[]
  apiGuideEdges?: Edge[]
  apiGuidePositions?: Record<string, { x: number; y: number }> // Позиции гайдов из API
}

// Данные гайдов по навыкам (позже вынести в API)
const skillGuidesData: Record<string, Node[]> = {
  'skill-1': [
    {
      id: 'guide-1-1',
      type: 'guide',
      data: {
        title: 'Основы полигонального моделирования',
        guideId: '1',
        status: 'completed',
        difficulty: 'beginner',
        thumbnail: '/home/features_guide1.jpeg',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'guide-1-2',
      type: 'guide',
      data: {
        title: 'Hard Surface моделирование',
        guideId: '2',
        status: 'in_progress',
        difficulty: 'intermediate',
        thumbnail: '/home/features_guide2.jpeg',
      },
      position: { x: 400, y: 100 },
    },
    {
      id: 'guide-1-3',
      type: 'guide',
      data: {
        title: 'Органическое моделирование',
        guideId: '3',
        status: 'not_started',
        difficulty: 'intermediate',
        thumbnail: '/home/features_guide3.jpeg',
      },
      position: { x: 250, y: 300 },
    },
    {
      id: 'guide-1-4',
      type: 'guide',
      data: {
        title: 'Продвинутая топология',
        guideId: '4',
        status: 'not_started',
        difficulty: 'advanced',
        thumbnail: '/home/features_guide4.jpeg',
      },
      position: { x: 250, y: 500 },
    },
  ],
  'skill-2': [
    {
      id: 'guide-2-1',
      type: 'guide',
      data: {
        title: 'UV Mapping основы',
        guideId: '5',
        status: 'completed',
        difficulty: 'beginner',
        thumbnail: '/home/features_guide1.jpeg',
      },
      position: { x: 100, y: 100 },
    },
    {
      id: 'guide-2-2',
      type: 'guide',
      data: {
        title: 'PBR текстурирование',
        guideId: '6',
        status: 'completed',
        difficulty: 'intermediate',
        thumbnail: '/home/features_guide2.jpeg',
      },
      position: { x: 400, y: 100 },
    },
    {
      id: 'guide-2-3',
      type: 'guide',
      data: {
        title: 'Процедурные текстуры',
        guideId: '7',
        status: 'not_started',
        difficulty: 'advanced',
        thumbnail: '/home/features_guide3.jpeg',
      },
      position: { x: 250, y: 300 },
    },
  ],
  'skill-3': [
    {
      id: 'guide-3-1',
      type: 'guide',
      data: {
        title: 'Основы анимации',
        guideId: '8',
        status: 'not_started',
        difficulty: 'beginner'
      },
      position: { x: 250, y: 150 },
    },
  ],
  'skill-4': [
    {
      id: 'guide-4-1',
      type: 'guide',
      data: {
        title: 'Настройка освещения',
        guideId: '9',
        status: 'completed',
        difficulty: 'intermediate',
        thumbnail: '/home/features_guide4.jpeg',
      },
      position: { x: 250, y: 150 },
    },
  ],
  'skill-5': [
    {
      id: 'guide-5-1',
      type: 'guide',
      data: {
        title: 'Основы композитинга',
        guideId: '10',
        status: 'not_started',
        difficulty: 'intermediate'
      },
      position: { x: 250, y: 150 },
    },
  ],
}

// Связи между гайдами
const skillEdgesData: Record<string, Edge[]> = {
  'skill-1': [
    {
      id: 'e1-1-2',
      source: 'guide-1-1',
      target: 'guide-1-2',
      type: 'smoothstep',
      animated: true,
      label: 'prerequisite',
    },
    {
      id: 'e1-1-3',
      source: 'guide-1-1',
      target: 'guide-1-3',
      type: 'smoothstep',
      animated: true,
      label: 'prerequisite',
    },
    {
      id: 'e1-2-4',
      source: 'guide-1-2',
      target: 'guide-1-4',
      type: 'smoothstep',
      style: { strokeDasharray: '5,5' },
      label: 'recommended',
    },
    {
      id: 'e1-3-4',
      source: 'guide-1-3',
      target: 'guide-1-4',
      type: 'smoothstep',
      style: { strokeDasharray: '5,5' },
      label: 'recommended',
    },
  ],
  'skill-2': [
    {
      id: 'e2-1-2',
      source: 'guide-2-1',
      target: 'guide-2-2',
      type: 'smoothstep',
      animated: true,
    },
    {
      id: 'e2-2-3',
      source: 'guide-2-2',
      target: 'guide-2-3',
      type: 'smoothstep',
      animated: true,
    },
  ],
  'skill-3': [],
  'skill-4': [],
  'skill-5': [],
}

const CUSTOM_GUIDES_KEY_PREFIX = 'anirum_custom_guides_';
const CUSTOM_GUIDE_EDGES_KEY_PREFIX = 'anirum_custom_guide_edges_';

// Функции для работы с локальными черновиками гайдов
export function getLocalGuides(skillId: string): { nodes: Node[] | null; edges: Edge[] | null } {
  if (typeof window === 'undefined') return { nodes: null, edges: null };

  try {
    const storedNodes = localStorage.getItem(`${CUSTOM_GUIDES_KEY_PREFIX}${skillId}`);
    const storedEdges = localStorage.getItem(`${CUSTOM_GUIDE_EDGES_KEY_PREFIX}${skillId}`);

    let nodes: Node[] | null = null;
    let edges: Edge[] | null = null;

    if (storedNodes) {
      const guidesData = JSON.parse(storedNodes);
      nodes = Object.entries(guidesData).map(([id, data]: [string, any]) => ({
        id,
        type: 'guide',
        data: {
          title: data.title,
          guideId: data.guideId,
          status: data.status,
          difficulty: data.difficulty,
          thumbnail: data.thumbnail,
          imageId: data.imageId, // Восстанавливаем imageId
          text: data.text,
          link: data.link,
        },
        position: data.position,
      }));
    }

    if (storedEdges) {
      edges = JSON.parse(storedEdges);
    }

    return { nodes, edges };
  } catch (error) {
    console.error('Ошибка загрузки локальных гайдов:', error);
    return { nodes: null, edges: null };
  }
}

export function clearLocalGuides(skillId: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${CUSTOM_GUIDES_KEY_PREFIX}${skillId}`);
  localStorage.removeItem(`${CUSTOM_GUIDE_EDGES_KEY_PREFIX}${skillId}`);
}

/**
 * Проверяет синхронизированы ли позиции гайдов в localStorage с API данными
 * Паттерн из Miro/Figma - localStorage очищается только когда данные совпадают с сервером
 */
export function areGuideNodesSynced(
  apiSkill: any,
  localGuides: { nodes: Node[] | null; edges: Edge[] | null }
): boolean {
  if (!localGuides.nodes || localGuides.nodes.length === 0) return true;
  if (!apiSkill?.guides || apiSkill.guides.length === 0) return false;

  // Сравниваем позиции каждого гайда
  for (const localNode of localGuides.nodes) {
    const nodeData = localNode.data as any;
    const guideDocId = nodeData.guideId;

    const apiGuide = apiSkill.guides.find((g: any) => g.documentId === guideDocId);

    if (!apiGuide) {
      // Новый гайд, которого еще нет на сервере
      return false;
    }

    // Получаем позицию из API (она может быть в guidePositions)
    const apiPosition = apiSkill.guidePositions?.[guideDocId] || { x: 0, y: 0 };

    // Сравниваем позиции с небольшой погрешностью (±1px из-за округления)
    const positionMatch =
      Math.abs(apiPosition.x - localNode.position.x) <= 1 &&
      Math.abs(apiPosition.y - localNode.position.y) <= 1;

    if (!positionMatch) {
      return false;
    }
  }

  return true;
}

export const SkillGuidesFlow = forwardRef<SkillGuidesFlowRef, SkillGuidesFlowProps>(({ skillId, skillData, onItemSelect, mode = 'view', onDelete, apiGuides, apiGuideEdges, apiGuidePositions }, ref) => {
  // Флаг первой загрузки для fitView
  const isFirstLoad = useRef(true);

  // Ref для актуального состояния nodes (для немедленного сохранения)
  const nodesRef = useRef<Node[]>([]);

  // Флаги загрузки данных из API (чтобы не перезаписывать при каждом обновлении)
  const isNodesLoadedFromApi = useRef(false);
  const isEdgesLoadedFromApi = useRef(false);

  // Генерация детерминированной позиции на основе ID (seed) - fallback если нет сохранённой позиции
  const getPositionFromId = useCallback((id: number, index: number) => {
    // Используем numeric ID как seed для генерации позиции
    const seed = id * 1000 + index;
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return {
      x: pseudoRandom(seed) * 400 + 100,
      y: pseudoRandom(seed + 1) * 400 + 100
    };
  }, []);

  // Загрузка гайдов из API
  const loadApiGuides = useCallback((): Node[] => {
    if (!apiGuides || apiGuides.length === 0) return [];

    return apiGuides.map((guide, index) => {
      // Приоритет: сохранённая позиция из API > детерминированная генерация
      const savedPosition = apiGuidePositions?.[guide.documentId];
      const position = savedPosition || getPositionFromId(guide.id, index);

      return {
        id: guide.documentId, // ID ноды = documentId для совместимости с edges
        type: 'guide' as const,
        data: {
          title: guide.title,
          guideId: guide.documentId, // ✅ Используем documentId вместо numeric ID
          numericId: guide.id, // Сохраняем numeric ID для API операций
          status: 'not_started',
          difficulty: 'beginner',
          thumbnail: guide.image?.formats?.thumbnail?.url || guide.image?.url,
        },
        position, // ✅ Сохранённая позиция из API или fallback
      };
    });
  }, [apiGuides, apiGuidePositions, getPositionFromId]);

  // Загрузка гайдов из localStorage (для всех навыков)
  const loadCustomGuides = useCallback((skillId: string): Node[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(`${CUSTOM_GUIDES_KEY_PREFIX}${skillId}`);
      if (!stored) return [];
      const guidesData = JSON.parse(stored);
      return Object.entries(guidesData).map(([id, data]: [string, any]) => ({
        id,
        type: 'guide',
        data: {
          title: data.title,
          guideId: data.guideId,
          numericId: data.numericId, // ✅ Восстанавливаем numericId
          status: data.status,
          difficulty: data.difficulty,
          thumbnail: data.thumbnail,
          imageId: data.imageId, // Восстанавливаем imageId
          text: data.text,
          link: data.link,
        },
        position: data.position, // ✅ Сохранённая позиция из localStorage
      }));
    } catch (error) {
      console.error('Ошибка загрузки гайдов:', error);
      return [];
    }
  }, []);

  // Загрузка связей между гайдами (для всех навыков)
  const loadCustomEdges = useCallback((skillId: string): Edge[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(`${CUSTOM_GUIDE_EDGES_KEY_PREFIX}${skillId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Ошибка загрузки связей гайдов:', error);
      return [];
    }
  }, []);

  // Определяем начальные данные: приоритет localStorage > API > моковые данные
  const isCustomSkill = skillId.startsWith('skill-') && !skillGuidesData[skillId];
  const localGuides = loadCustomGuides(skillId);
  const hasLocalDraft = localGuides.length > 0;

  // Используем локальные данные если есть, иначе данные из API, иначе моковые
  const initialNodes = hasLocalDraft
    ? localGuides
    : (apiGuides && apiGuides.length > 0
      ? loadApiGuides()
      : (skillGuidesData[skillId] || []));

  const localEdges = loadCustomEdges(skillId);
  const hasLocalEdges = localEdges.length > 0;

  const initialEdges = hasLocalEdges
    ? localEdges
    : (apiGuideEdges || skillEdgesData[skillId] || []);

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Синхронизируем ref с актуальным состоянием nodes
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Сбрасываем флаги загрузки при смене навыка
  useEffect(() => {
    isNodesLoadedFromApi.current = false;
    isEdgesLoadedFromApi.current = false;
  }, [skillId]);

  // Сохранение гайдов в localStorage (для публикации)
  const saveCustomGuides = useCallback((updatedNodes: Node[]) => {
    const guidesData: Record<string, any> = {};
    updatedNodes.forEach(node => {
      if (node.type === 'guide') {
        guidesData[node.id] = {
          title: node.data.title,
          guideId: node.data.guideId,
          numericId: node.data.numericId, // ✅ Сохраняем numericId
          status: node.data.status,
          difficulty: node.data.difficulty,
          thumbnail: node.data.thumbnail,
          imageId: node.data.imageId, // Сохраняем imageId для публикации
          text: node.data.text,
          link: node.data.link,
          position: node.position, // ✅ Сохраняем позицию
        };
      }
    });

    localStorage.setItem(`${CUSTOM_GUIDES_KEY_PREFIX}${skillId}`, JSON.stringify(guidesData));

    // Триггерим событие для обновления hasUnsavedChanges в page.tsx
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('local-draft-updated', { detail: { skillId } }));
    }
  }, [skillId]);

  // Кастомный обработчик изменения nodes с немедленным сохранением
  const onNodesChange = useCallback((changes: any[]) => {
    onNodesChangeInternal(changes)

    // Сохраняем только реальные изменения (перемещение, удаление, изменение размеров)
    const hasRealChanges = changes.some((change: any) =>
      change.type === 'position' || change.type === 'dimensions' || change.type === 'remove'
    )

    if (hasRealChanges && mode === 'edit') {
      // Используем queueMicrotask для отложенного сохранения (после применения изменений)
      queueMicrotask(() => {
        saveCustomGuides(nodesRef.current)
      })
    }
  }, [onNodesChangeInternal, mode, saveCustomGuides])

  // Обновляем nodes когда приходят данные из API (только при первой загрузке, как в Miro)
  useEffect(() => {
    // Если уже загружали из API, не перезаписываем (optimistic updates)
    if (isNodesLoadedFromApi.current) return;

    // Проверяем, есть ли локальные изменения
    const localGuides = loadCustomGuides(skillId);
    const hasLocalDraft = localGuides.length > 0;

    // Если есть локальные изменения, не перезаписываем
    if (hasLocalDraft) {
      isNodesLoadedFromApi.current = true;
      return;
    }

    // Если есть данные из API, загружаем их только один раз
    if (apiGuides && apiGuides.length > 0) {
      const apiNodes = loadApiGuides();
      if (apiNodes.length > 0) {
        console.log('🔄 Загружаем гайды из API (первая загрузка):', apiNodes.length);
        setNodes(apiNodes.map(node => ({ ...node, data: { ...node.data, mode } })));
        isNodesLoadedFromApi.current = true;
      }
    }
  }, [apiGuides, skillId, mode, loadApiGuides, loadCustomGuides, setNodes]);

  // Обновляем edges когда приходят данные из API (только при первой загрузке, как в Miro)
  useEffect(() => {
    // Если уже загружали из API, не перезаписываем (optimistic updates)
    if (isEdgesLoadedFromApi.current) return;

    // Проверяем, есть ли локальные изменения
    const localEdges = loadCustomEdges(skillId);
    const hasLocalEdges = localEdges.length > 0;

    // Если есть локальные изменения, не перезаписываем
    if (hasLocalEdges) {
      console.log('🔄 Используем локальные edges:', localEdges.length);
      isEdgesLoadedFromApi.current = true;
      return;
    }

    // Если есть данные из API, загружаем их только один раз
    if (apiGuideEdges && apiGuideEdges.length > 0) {
      console.log('🔄 Загружаем связи гайдов из API (первая загрузка):', apiGuideEdges.length);
      console.log('🔍 apiGuideEdges:', JSON.stringify(apiGuideEdges, null, 2));
      console.log('🔍 Текущие nodes (ids):', nodes.map(n => ({ id: n.id, guideId: n.data.guideId })));
      setEdges(apiGuideEdges);
      isEdgesLoadedFromApi.current = true;
    } else {
      console.log('⚠️ Нет apiGuideEdges для загрузки');
    }
  }, [apiGuideEdges, skillId, loadCustomEdges, setEdges, nodes]);

  // Кастомный обработчик изменения edges с сохранением стилей выделения
  const onEdgesChange = useCallback((changes: any[]) => {
    onEdgesChangeInternal(changes)

    // После применения изменений обновляем стили с учетом selected
    setEdges((eds) => {
      const updatedEdges = eds.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        const targetNode = nodes.find((n) => n.id === edge.target)

        const isSourceCompleted = sourceNode?.data?.status === 'completed'
        const isTargetCompleted = targetNode?.data?.status === 'completed'
        const bothCompleted = isSourceCompleted && isTargetCompleted

        const baseStroke = bothCompleted ? '#f97316' : '#9ca3af'
        const baseStrokeWidth = edge.style?.strokeWidth || 2

        return {
          ...edge,
          // Анимация: либо при selected, либо при bothCompleted
          animated: edge.selected || bothCompleted,
          style: {
            ...edge.style,
            stroke: edge.selected ? '#3b82f6' : baseStroke,
            strokeDasharray: edge.selected ? '5,5' : (bothCompleted ? 'none' : '5,5'),
            strokeWidth: edge.selected ? 3 : baseStrokeWidth,
          },
        }
      })

      // Сохраняем изменения в localStorage (для удаления связей и других изменений)
      localStorage.setItem(`${CUSTOM_GUIDE_EDGES_KEY_PREFIX}${skillId}`, JSON.stringify(updatedEdges))

      // Триггерим событие для обновления hasUnsavedChanges в page.tsx
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('local-draft-updated', { detail: { skillId } }))
      }

      return updatedEdges
    })
  }, [onEdgesChangeInternal, setEdges, nodes, skillId])

  // Обновляем mode во всех нодах при изменении режима
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, mode },
      }))
    )
  }, [mode, setNodes])

  // Обновляем стили линий только при изменении nodes (статус completed)
  useEffect(() => {
    if (nodes.length === 0) return;

    setEdges((eds) =>
      eds.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        const targetNode = nodes.find((n) => n.id === edge.target)

        const isSourceCompleted = sourceNode?.data?.status === 'completed'
        const isTargetCompleted = targetNode?.data?.status === 'completed'
        const bothCompleted = isSourceCompleted && isTargetCompleted

        const baseStroke = bothCompleted ? '#f97316' : '#9ca3af'

        return {
          ...edge,
          animated: edge.selected || bothCompleted,
          style: {
            ...edge.style,
            stroke: edge.selected ? '#3b82f6' : baseStroke,
            strokeDasharray: edge.selected ? '5,5' : (bothCompleted ? 'none' : '5,5'),
            strokeWidth: edge.selected ? 3 : 2,
          },
        }
      })
    )
  }, [nodes, setEdges, mode])

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => {
      const updatedEdges = addEdge({ ...params, type: 'smoothstep' }, eds);
      // Сохраняем связи в localStorage (для публикации)
      localStorage.setItem(`${CUSTOM_GUIDE_EDGES_KEY_PREFIX}${skillId}`, JSON.stringify(updatedEdges));

      // Триггерим событие для обновления hasUnsavedChanges в page.tsx
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('local-draft-updated', { detail: { skillId } }))
      }

      return updatedEdges;
    });
  }, [setEdges, skillId, mode])

  // Обработчик клика - показываем инфо в правом блоке
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.type === 'guide') {
      // Всегда показываем инфо в правом блоке
      onItemSelect({
        type: 'guide',
        title: node.data.title as string,
        thumbnail: node.data.thumbnail as string | undefined,
      })
    }
  }, [onItemSelect])

  // Конвертация File в base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Создание нового гайда
  const handleCreateGuide = useCallback(async (data: { title: string; thumbnail?: File }) => {
    const newId = `guide-${skillId}-${Date.now()}`
    const timestamp = Date.now();

    // Конвертируем изображение в base64 если есть
    let thumbnailBase64: string | undefined;
    if (data.thumbnail) {
      thumbnailBase64 = await fileToBase64(data.thumbnail);
    }

    const newNode: Node = {
      id: newId,
      type: 'guide',
      data: {
        title: data.title,
        guideId: newId,
        status: 'not_started',
        difficulty: 'beginner',
        thumbnail: thumbnailBase64,
        mode,
      },
      position: getPositionFromId(timestamp, nodes.length), // ✅ Детерминированная позиция
    }

    setNodes((nds) => {
      const updatedNodes = [...nds, newNode];
      saveCustomGuides(updatedNodes);
      return updatedNodes;
    });
  }, [skillId, setNodes, saveCustomGuides, mode, getPositionFromId, nodes.length])

  // Добавление гайда из сайдбара через ref
  useImperativeHandle(ref, () => ({
    addGuide: (guideData: { id: string; numericId?: number; title: string; thumbnail?: string }) => {
      console.log('🎯 SkillGuidesFlow: Получен гайд для добавления:', guideData);

      // Проверяем, не добавлен ли уже этот гайд (по documentId)
      const exists = nodes.some(node => node.data.guideId === guideData.id || node.id === guideData.id)
      if (exists) {
        console.log('⚠️ Гайд уже добавлен в древо:', guideData.id);
        return
      }

      // Используем hash строки для генерации позиции
      const hashCode = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash);
      };

      const newNode: Node = {
        id: guideData.id, // ✅ Используем documentId как id ноды для совместимости с edges
        type: 'guide',
        data: {
          title: guideData.title,
          guideId: guideData.id, // ✅ documentId гайда
          numericId: guideData.numericId, // ✅ Numeric ID для API операций
          status: 'not_started',
          difficulty: 'beginner',
          thumbnail: guideData.thumbnail,
          mode,
        },
        position: getPositionFromId(hashCode(guideData.id), nodes.length), // ✅ Детерминированная позиция из documentId
      }

      console.log('✅ Создана новая нода:', newNode);

      setNodes((nds) => {
        const updatedNodes = [...nds, newNode];
        console.log('✅ Обновлён массив нод, всего:', updatedNodes.length);
        saveCustomGuides(updatedNodes);
        return updatedNodes;
      });
    }
  }), [nodes, setNodes, saveCustomGuides, mode, getPositionFromId])

  // fitView только при первой загрузке
  useEffect(() => {
    if (isFirstLoad.current && nodes.length > 0) {
      isFirstLoad.current = false;
      // Небольшая задержка для корректного рендера
      setTimeout(() => {
        const viewport = document.querySelector('.react-flow__viewport');
        if (viewport) {
          // ReactFlow автоматически применит fitView при первом рендере
        }
      }, 100);
    }
  }, [nodes.length]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={mode === 'edit' ? onNodesChange : undefined}
        onEdgesChange={mode === 'edit' ? onEdgesChange : undefined}
        onConnect={mode === 'edit' ? onConnect : undefined}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView={isFirstLoad.current}
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
        }}
        connectionMode={ConnectionMode.Loose}
        elevateEdgesOnSelect
        nodesDraggable={mode === 'edit'}
        nodesConnectable={mode === 'edit'}
        elementsSelectable={true}
        edgesReconnectable={mode === 'edit'}
      >
      <Background />
      <Controls />
      <MiniMap />

      {/* Кнопки управления - только в режиме редактирования */}
      {mode === 'edit' && (
        <Panel position="top-right" className="space-x-2">
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="sm"
            className="gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-background/80"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Создать гайд
          </Button>

          {/* Кнопка удаления - только для кастомных навыков */}
          {onDelete && (
            <Button
              onClick={onDelete}
              size="sm"
              className="gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-destructive/80"
              variant="outline"
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>
          )}
        </Panel>
      )}

      </ReactFlow>

      <CreateGuideDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateGuide}
      />
    </>
  )
})

SkillGuidesFlow.displayName = 'SkillGuidesFlow'
