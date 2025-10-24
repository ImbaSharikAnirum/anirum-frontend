'use client'

import { ReactFlow, Background, Controls, MiniMap, Node, Edge, NodeTypes, useNodesState, useEdgesState, Panel, ConnectionMode, addEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { GuideNode } from '@/shared/ui'
import { useCallback, useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { CreateGuideDialog } from '@/features/guide-create'

const nodeTypes: NodeTypes = {
  guide: GuideNode as any,
}

export interface SkillGuidesFlowRef {
  addGuide: (guideData: { id: string; title: string; thumbnail?: string }) => void
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

export const SkillGuidesFlow = forwardRef<SkillGuidesFlowRef, SkillGuidesFlowProps>(({ skillId, skillData, onItemSelect, mode = 'view', onDelete, apiGuides, apiGuideEdges }, ref) => {
  // Загрузка гайдов из API
  const loadApiGuides = useCallback((): Node[] => {
    if (!apiGuides || apiGuides.length === 0) return [];

    return apiGuides.map((guide) => ({
      id: guide.documentId,
      type: 'guide' as const,
      data: {
        title: guide.title,
        guideId: guide.id, // numeric ID
        status: 'not_started',
        difficulty: 'beginner',
        thumbnail: guide.image?.formats?.thumbnail?.url || guide.image?.url,
      },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
    }));
  }, [apiGuides]);

  // Загрузка гайдов из localStorage для кастомных навыков
  const loadCustomGuides = useCallback((skillId: string): Node[] => {
    if (typeof window === 'undefined' || !skillId.startsWith('skill-')) return [];
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
          status: data.status,
          difficulty: data.difficulty,
          thumbnail: data.thumbnail,
          imageId: data.imageId, // Восстанавливаем imageId
        },
        position: data.position,
      }));
    } catch (error) {
      console.error('Ошибка загрузки гайдов:', error);
      return [];
    }
  }, []);

  // Загрузка связей между гайдами
  const loadCustomEdges = useCallback((skillId: string): Edge[] => {
    if (typeof window === 'undefined' || !skillId.startsWith('skill-')) return [];
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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Обновляем nodes когда приходят данные из API (после загрузки страницы или публикации)
  useEffect(() => {
    // Проверяем, есть ли локальные изменения
    const localGuides = loadCustomGuides(skillId);
    const hasLocalDraft = localGuides.length > 0;

    // Если есть локальные изменения, не перезаписываем
    if (hasLocalDraft) return;

    // Если есть данные из API, загружаем их
    if (apiGuides && apiGuides.length > 0) {
      const apiNodes = loadApiGuides();
      if (apiNodes.length > 0) {
        console.log('🔄 Загружаем гайды из API:', apiNodes.length);
        setNodes(apiNodes.map(node => ({ ...node, data: { ...node.data, mode } })));
      }
    }
  }, [apiGuides, skillId, mode, loadApiGuides, loadCustomGuides, setNodes]);

  // Обновляем edges когда приходят данные из API
  useEffect(() => {
    // Проверяем, есть ли локальные изменения
    const localEdges = loadCustomEdges(skillId);
    const hasLocalEdges = localEdges.length > 0;

    // Если есть локальные изменения, не перезаписываем
    if (hasLocalEdges) return;

    // Если есть данные из API, загружаем их
    if (apiGuideEdges && apiGuideEdges.length > 0) {
      console.log('🔄 Загружаем связи гайдов из API:', apiGuideEdges.length);
      setEdges(apiGuideEdges);
    }
  }, [apiGuideEdges, skillId, loadCustomEdges, setEdges]);

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
  }, [nodes, setEdges])

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
  }, [setEdges, skillId])

  // Сохранение гайдов в localStorage (для публикации)
  const saveCustomGuides = useCallback((updatedNodes: Node[]) => {
    const guidesData: Record<string, any> = {};
    updatedNodes.forEach(node => {
      if (node.type === 'guide') {
        guidesData[node.id] = {
          title: node.data.title,
          guideId: node.data.guideId,
          status: node.data.status,
          difficulty: node.data.difficulty,
          thumbnail: node.data.thumbnail,
          imageId: node.data.imageId, // Сохраняем imageId для публикации
          position: node.position,
        };
      }
    });

    localStorage.setItem(`${CUSTOM_GUIDES_KEY_PREFIX}${skillId}`, JSON.stringify(guidesData));

    // Триггерим событие для обновления hasUnsavedChanges в page.tsx
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('local-draft-updated', { detail: { skillId } }));
    }
  }, [skillId]);

  // Обработчик изменения нод - сохраняем при изменении
  useEffect(() => {
    if (nodes.length > 0) {
      saveCustomGuides(nodes);
    }
  }, [nodes, saveCustomGuides]);

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
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
    }

    setNodes((nds) => {
      const updatedNodes = [...nds, newNode];
      saveCustomGuides(updatedNodes);
      return updatedNodes;
    });
  }, [skillId, setNodes, saveCustomGuides, mode])

  // Добавление гайда из сайдбара через ref
  useImperativeHandle(ref, () => ({
    addGuide: (guideData: { id: string; title: string; thumbnail?: string }) => {
      // Проверяем, не добавлен ли уже этот гайд
      const exists = nodes.some(node => node.data.guideId === guideData.id)
      if (exists) {
        console.log('Гайд уже добавлен в древо')
        return
      }

      const newNode: Node = {
        id: `guide-sidebar-${guideData.id}-${Date.now()}`,
        type: 'guide',
        data: {
          title: guideData.title,
          guideId: guideData.id,
          status: 'not_started',
          difficulty: 'beginner',
          thumbnail: guideData.thumbnail,
          mode,
        },
        position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      }

      setNodes((nds) => {
        const updatedNodes = [...nds, newNode];
        saveCustomGuides(updatedNodes);
        return updatedNodes;
      });
    }
  }), [nodes, setNodes, saveCustomGuides, mode])

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
        fitView
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
