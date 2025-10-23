'use client'

import { ReactFlow, Background, Controls, MiniMap, Node, Edge, NodeTypes, useNodesState, useEdgesState, Panel, ConnectionMode, addEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { SkillNode } from '@/shared/ui'
import { useCallback, useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Upload, Trash2, Edit } from 'lucide-react'
import { CreateBranchDialog } from '@/features/branch-create'
import { EditSkillDialog } from '@/features/skill-edit'
import { skillTreeAPI } from '@/entities/skill-tree'

const nodeTypes: NodeTypes = {
  skill: SkillNode as any,
}

interface SkillsTreeFlowProps {
  treeId: string
  onSkillOpen: (skillId: string) => void
  onItemSelect: (item: { type: 'skill'; title: string; thumbnail?: string; guideCount?: number } | null) => void
  initialNodes?: Node[]
  initialEdges?: Edge[]
  mode?: 'view' | 'edit'
  isCustomTree?: boolean
  onPublish?: () => Promise<void>
  onDelete?: () => void
  onSkillEdit?: (skillId: string, data: { title: string; image?: string; imageId?: number }) => void
}

// Функции для работы с локальными изменениями
export function clearLocalDraft(treeId: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${LOCAL_DRAFT_NODES_KEY_PREFIX}${treeId}`);
  localStorage.removeItem(`${LOCAL_DRAFT_EDGES_KEY_PREFIX}${treeId}`);
}

export function getLocalDraft(treeId: string): { nodes: Node[] | null; edges: Edge[] | null } {
  if (typeof window === 'undefined') return { nodes: null, edges: null };

  const localNodesKey = `${LOCAL_DRAFT_NODES_KEY_PREFIX}${treeId}`;
  const localEdgesKey = `${LOCAL_DRAFT_EDGES_KEY_PREFIX}${treeId}`;

  const savedNodes = localStorage.getItem(localNodesKey);
  const savedEdges = localStorage.getItem(localEdgesKey);

  return {
    nodes: savedNodes ? JSON.parse(savedNodes) : null,
    edges: savedEdges ? JSON.parse(savedEdges) : null,
  };
}

// Данные навыков по умолчанию (позже вынести в API)
const defaultInitialNodes: Node[] = [
  {
    id: 'skill-1',
    type: 'skill',
    data: {
      label: '3D Моделирование',
      color: '#3b82f6',
      thumbnail: '/home/features_guide1.jpeg',
      guideCount: 4,
    },
    position: { x: 100, y: 100 },
  },
  {
    id: 'skill-2',
    type: 'skill',
    data: {
      label: 'Текстурирование',
      color: '#8b5cf6',
      thumbnail: '/home/features_guide2.jpeg',
      guideCount: 3,
      completed: true, // 2 гайда выполнены
    },
    position: { x: 400, y: 100 },
  },
  {
    id: 'skill-3',
    type: 'skill',
    data: {
      label: 'Анимация',
      color: '#ec4899',
      thumbnail: '/home/features_guide3.jpeg',
      guideCount: 1,
    },
    position: { x: 700, y: 100 },
  },
  {
    id: 'skill-4',
    type: 'skill',
    data: {
      label: 'Рендеринг',
      color: '#f59e0b',
      thumbnail: '/home/features_guide4.jpeg',
      guideCount: 1,
      completed: true, // Все гайды выполнены
    },
    position: { x: 250, y: 350 },
  },
  {
    id: 'skill-5',
    type: 'skill',
    data: {
      label: 'Композитинг',
      color: '#10b981',
      thumbnail: '/home/features_guide5.jpeg',
      guideCount: 1,
    },
    position: { x: 550, y: 350 },
  },
]

const defaultInitialEdges: Edge[] = [
  {
    id: 'e1-4',
    source: 'skill-1',
    target: 'skill-4',
    type: 'smoothstep',
    animated: true,
  },
  {
    id: 'e2-4',
    source: 'skill-2',
    target: 'skill-4',
    type: 'smoothstep',
  },
  {
    id: 'e4-5',
    source: 'skill-4',
    target: 'skill-5',
    type: 'smoothstep',
    animated: true,
  },
]

const CUSTOM_SKILLS_KEY_PREFIX = 'anirum_custom_skills_';
const CUSTOM_SKILL_EDGES_KEY_PREFIX = 'anirum_custom_skill_edges_';
const LOCAL_DRAFT_NODES_KEY_PREFIX = 'anirum_draft_nodes_';
const LOCAL_DRAFT_EDGES_KEY_PREFIX = 'anirum_draft_edges_';

export function SkillsTreeFlow({ treeId, onSkillOpen, onItemSelect, initialNodes, initialEdges, mode = 'view', isCustomTree = false, onPublish, onDelete, onSkillEdit }: SkillsTreeFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || defaultInitialNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges || defaultInitialEdges)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [hasLocalChanges, setHasLocalChanges] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: Node } | null>(null)
  const [editingSkill, setEditingSkill] = useState<{ id: string; title: string; thumbnail?: string; imageId?: number } | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Кастомный обработчик изменения edges с сохранением стилей выделения
  const onEdgesChange = useCallback((changes: any[]) => {
    onEdgesChangeInternal(changes)

    // После применения изменений обновляем стили с учетом selected
    setEdges((eds) =>
      eds.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        const targetNode = nodes.find((n) => n.id === edge.target)

        const isSourceCompleted = sourceNode?.data?.completed === true
        const isTargetCompleted = targetNode?.data?.completed === true
        const bothCompleted = isSourceCompleted && isTargetCompleted

        const baseStroke = bothCompleted ? '#f97316' : '#9ca3af'
        const baseStrokeWidth = 2

        return {
          ...edge,
          // Анимация: либо при selected, либо при bothCompleted
          animated: edge.selected || bothCompleted,
          style: {
            stroke: edge.selected ? '#3b82f6' : baseStroke,
            strokeDasharray: edge.selected ? '5,5' : (bothCompleted ? 'none' : '5,5'),
            strokeWidth: edge.selected ? 3 : baseStrokeWidth,
          },
        }
      })
    )
  }, [onEdgesChangeInternal, setEdges, nodes])

  // Загрузка локальных изменений при монтировании
  useEffect(() => {
    if (!isCustomTree || !treeId) return;

    const localNodesKey = `${LOCAL_DRAFT_NODES_KEY_PREFIX}${treeId}`;
    const localEdgesKey = `${LOCAL_DRAFT_EDGES_KEY_PREFIX}${treeId}`;

    const savedNodes = localStorage.getItem(localNodesKey);
    const savedEdges = localStorage.getItem(localEdgesKey);

    if (savedNodes) {
      try {
        const parsedNodes = JSON.parse(savedNodes);
        setNodes(parsedNodes);
        setHasLocalChanges(true);
      } catch (error) {
        console.error('Ошибка загрузки локальных nodes:', error);
      }
    }

    if (savedEdges) {
      try {
        const parsedEdges = JSON.parse(savedEdges);
        setEdges(parsedEdges);
      } catch (error) {
        console.error('Ошибка загрузки локальных edges:', error);
      }
    }
  }, [treeId, isCustomTree]);

  // Обновляем mode во всех нодах при изменении режима
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, mode },
      }))
    )
  }, [mode, setNodes])

  // Обновляем стили линий только при изменении nodes (completed статус)
  useEffect(() => {
    if (nodes.length === 0) return;

    setEdges((eds) =>
      eds.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source)
        const targetNode = nodes.find((n) => n.id === edge.target)

        const isSourceCompleted = sourceNode?.data?.completed === true
        const isTargetCompleted = targetNode?.data?.completed === true
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
      // Сохраняем связи для кастомных деревьев
      if (isCustomTree) {
        localStorage.setItem(`${CUSTOM_SKILL_EDGES_KEY_PREFIX}${treeId}`, JSON.stringify(updatedEdges));
      }
      return updatedEdges;
    });
  }, [setEdges, isCustomTree, treeId])

  // Закрытие контекстного меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && event.target instanceof HTMLElement && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null)
      }
    }

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [contextMenu])

  // Обработчик клика - показываем инфо в правом блоке
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // Закрываем контекстное меню при обычном клике
    setContextMenu(null)

    if (node.type === 'skill') {
      onItemSelect({
        type: 'skill',
        title: node.data.label as string,
        thumbnail: node.data.thumbnail as string | undefined,
        guideCount: node.data.guideCount as number | undefined,
      })
    }
  }, [onItemSelect])

  // Обработчик двойного клика - открыть гайды навыка
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.type === 'skill') {
      onSkillOpen(node.id)
    }
  }, [onSkillOpen])

  // Обработчик контекстного меню на ноде
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    // Показываем меню только в режиме редактирования и для навыков
    if (mode === 'edit' && node.type === 'skill') {
      event.preventDefault()
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        node,
      })
    }
  }, [mode])

  // Открытие диалога редактирования
  const handleEditSkill = useCallback(() => {
    if (contextMenu) {
      setEditingSkill({
        id: contextMenu.node.id,
        title: contextMenu.node.data.label as string,
        thumbnail: contextMenu.node.data.thumbnail as string | undefined,
        imageId: contextMenu.node.data.imageId as number | undefined,
      })
      setContextMenu(null)
    }
  }, [contextMenu])

  // Сохранение изменений навыка
  const handleSaveSkill = useCallback((data: { title: string; image?: string; imageId?: number }) => {
    if (!editingSkill) return

    // Обновляем ноду локально
    setNodes((nds) =>
      nds.map((node) =>
        node.id === editingSkill.id
          ? {
              ...node,
              data: {
                ...node.data,
                label: data.title,
                thumbnail: data.image || node.data.thumbnail,
                imageId: data.imageId !== undefined ? data.imageId : node.data.imageId,
              },
            }
          : node
      )
    )

    // Вызываем callback для обновления в parent компоненте
    if (onSkillEdit) {
      onSkillEdit(editingSkill.id, data)
    }

    setEditingSkill(null)
  }, [editingSkill, setNodes, onSkillEdit])

  // Сохранение навыков в localStorage для кастомных деревьев
  const saveCustomSkills = useCallback((updatedNodes: Node[]) => {
    if (!treeId.startsWith('custom-tree-')) return;

    const skillsData: Record<string, any> = {};
    updatedNodes.forEach(node => {
      if (node.type === 'skill') {
        skillsData[node.id] = {
          label: node.data.label,
          thumbnail: node.data.thumbnail,
          guideCount: node.data.guideCount || 0,
        };
      }
    });

    localStorage.setItem(`${CUSTOM_SKILLS_KEY_PREFIX}${treeId}`, JSON.stringify(skillsData));
  }, [treeId]);

  // Сохранение nodes локально при их изменении в режиме редактирования
  useEffect(() => {
    if (!isCustomTree || mode !== 'edit' || nodes.length === 0) return;

    const localNodesKey = `${LOCAL_DRAFT_NODES_KEY_PREFIX}${treeId}`;
    localStorage.setItem(localNodesKey, JSON.stringify(nodes));
    setHasLocalChanges(true);

    // Отправляем событие для обновления parent компонента
    window.dispatchEvent(new CustomEvent('local-draft-updated', { detail: { treeId } }));
  }, [nodes, isCustomTree, mode, treeId]);

  // Сохранение edges локально при их изменении в режиме редактирования
  useEffect(() => {
    if (!isCustomTree || mode !== 'edit') return;

    const localEdgesKey = `${LOCAL_DRAFT_EDGES_KEY_PREFIX}${treeId}`;
    localStorage.setItem(localEdgesKey, JSON.stringify(edges));
    setHasLocalChanges(true);
  }, [edges, isCustomTree, mode, treeId]);

  // Создание нового навыка
  const handleCreateSkill = useCallback(async (data: { label: string; thumbnail?: File }) => {
    const newId = `skill-${Date.now()}`

    // Загружаем изображение сразу на сервер если есть
    let thumbnailUrl: string | undefined
    let imageId: number | undefined

    if (data.thumbnail) {
      try {
        // Загружаем изображение через существующий метод API
        const uploadedIds = await skillTreeAPI.uploadImage(data.thumbnail)
        imageId = uploadedIds[0]

        // Получаем URL для отображения
        const response = await fetch(`/api/upload/files/${imageId}`)
        if (response.ok) {
          const imageData = await response.json()
          thumbnailUrl = imageData.url
        }

        console.log('✅ Изображение загружено при создании навыка:', { id: imageId, url: thumbnailUrl })
      } catch (error) {
        console.error('Ошибка загрузки изображения:', error)
        alert('Не удалось загрузить изображение. Навык будет создан без изображения.')
      }
    }

    const newNode: Node = {
      id: newId,
      type: 'skill',
      data: {
        label: data.label,
        thumbnail: thumbnailUrl,  // URL для отображения
        imageId: imageId,         // ID для публикации
        guideCount: 0,
        mode,
      },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
    }

    setNodes((nds) => {
      const updatedNodes = [...nds, newNode];
      saveCustomSkills(updatedNodes);
      return updatedNodes;
    });
  }, [setNodes, saveCustomSkills, mode])

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={mode === 'edit' ? onNodesChange : undefined}
        onEdgesChange={mode === 'edit' ? onEdgesChange : undefined}
        onConnect={mode === 'edit' ? onConnect : undefined}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        fitView
        zoomOnDoubleClick={false}
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
              Создать навык
            </Button>

            {/* Кнопка публикации - только для кастомных деревьев */}
            {isCustomTree && onPublish && (
              <Button
                onClick={onPublish}
                size="sm"
                className="gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:bg-background/80"
                variant="outline"
              >
                <Upload className="h-4 w-4" />
                Опубликовать
              </Button>
            )}

            {/* Кнопка удаления - только для кастомных деревьев */}
            {isCustomTree && onDelete && (
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

      <CreateBranchDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateSkill}
      />

      {/* Контекстное меню */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-background border rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
            onClick={handleEditSkill}
          >
            <Edit className="h-4 w-4" />
            Редактировать навык
          </button>
        </div>
      )}

      {/* Диалог редактирования навыка */}
      <EditSkillDialog
        open={!!editingSkill}
        onOpenChange={(open) => !open && setEditingSkill(null)}
        skill={editingSkill}
        onSave={handleSaveSkill}
      />
    </>
  )
}
