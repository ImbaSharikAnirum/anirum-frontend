'use client'

import { ReactFlow, Background, Controls, MiniMap, Node, Edge, NodeTypes, useNodesState, useEdgesState, Panel, ConnectionMode, addEdge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { SkillNode } from '@/shared/ui'
import { useCallback, useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit } from 'lucide-react'
import { CreateBranchDialog } from '@/features/branch-create'
import { EditSkillDialog } from '@/features/skill-edit'
import { skillTreeAPI } from '@/entities/skill-tree'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
  onDelete?: () => void
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

/**
 * Проверяет синхронизированы ли позиции навыков в localStorage с API данными
 * Паттерн из Miro/Figma - localStorage очищается только когда данные совпадают с сервером
 */
export function areTreeNodesSynced(
  apiTree: any,
  localDraft: { nodes: Node[] | null; edges: Edge[] | null }
): boolean {
  if (!localDraft.nodes || localDraft.nodes.length === 0) return true;
  if (!apiTree?.skills || apiTree.skills.length === 0) return false;

  // Сравниваем позиции каждого навыка
  for (const localNode of localDraft.nodes) {
    const apiSkill = apiTree.skills.find((s: any) => s.documentId === localNode.id);

    if (!apiSkill) {
      // Новый навык, которого еще нет на сервере
      return false;
    }

    // Сравниваем позиции с небольшой погрешностью (±1px из-за округления)
    const positionMatch =
      Math.abs((apiSkill.position?.x ?? 0) - localNode.position.x) <= 1 &&
      Math.abs((apiSkill.position?.y ?? 0) - localNode.position.y) <= 1;

    if (!positionMatch) {
      return false;
    }
  }

  return true;
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
const LOCAL_DRAFT_NODES_KEY_PREFIX = 'anirum_draft_nodes_';
const LOCAL_DRAFT_EDGES_KEY_PREFIX = 'anirum_draft_edges_';

export function SkillsTreeFlow({ treeId, onSkillOpen, onItemSelect, initialNodes, initialEdges, mode = 'view', isCustomTree = false, onDelete }: SkillsTreeFlowProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes || defaultInitialNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges || defaultInitialEdges)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: Node } | null>(null)
  const [editingSkill, setEditingSkill] = useState<{ id: string; title: string; thumbnail?: string; imageId?: number } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [skillToDelete, setSkillToDelete] = useState<{ id: string; title: string } | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Ref для актуального состояния nodes (для немедленного сохранения)
  const nodesRef = useRef<Node[]>(nodes);

  // Синхронизируем ref с актуальным состоянием nodes
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Кастомный обработчик изменения nodes с немедленным сохранением (как в Miro)
  const onNodesChange = useCallback((changes: any[]) => {
    onNodesChangeInternal(changes)

    // Сохраняем только реальные изменения (перемещение, удаление, изменение размеров)
    const hasRealChanges = changes.some((change: any) =>
      change.type === 'position' || change.type === 'dimensions' || change.type === 'remove'
    )

    if (hasRealChanges && mode === 'edit' && isCustomTree) {
      // Используем queueMicrotask для отложенного сохранения (после применения изменений)
      queueMicrotask(() => {
        localStorage.setItem(`${LOCAL_DRAFT_NODES_KEY_PREFIX}${treeId}`, JSON.stringify(nodesRef.current))

        // Триггерим событие для автосохранения в page.tsx (как в Miro)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('local-draft-updated', { detail: { treeId } }))
        }
      })
    }
  }, [onNodesChangeInternal, mode, isCustomTree, treeId])

  // Кастомный обработчик изменения edges с сохранением стилей выделения
  const onEdgesChange = useCallback((changes: any[]) => {
    onEdgesChangeInternal(changes)

    // После применения изменений обновляем стили с учетом selected
    setEdges((eds) => {
      const updatedEdges = eds.map((edge) => {
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

      // Сохраняем изменения в localStorage (для удаления связей и других изменений)
      if (isCustomTree) {
        localStorage.setItem(`${LOCAL_DRAFT_EDGES_KEY_PREFIX}${treeId}`, JSON.stringify(updatedEdges))

        // Триггерим событие для обновления hasUnsavedChanges в page.tsx
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('local-draft-updated', { detail: { treeId } }))
        }
      }

      return updatedEdges
    })
  }, [onEdgesChangeInternal, setEdges, nodes, isCustomTree, treeId])

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
        localStorage.setItem(`${LOCAL_DRAFT_EDGES_KEY_PREFIX}${treeId}`, JSON.stringify(updatedEdges));

        // Триггерим событие для обновления hasUnsavedChanges в page.tsx
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('local-draft-updated', { detail: { treeId } }))
        }
      }
      return updatedEdges;
    });
  }, [setEdges, isCustomTree, treeId])

  // Закрытие контекстного меню при клике вне его и по ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && event.target instanceof HTMLElement && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null)
      }
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(null)
      }
    }

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscKey)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscKey)
      }
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

  // Обработчик клика на пустое место canvas - закрываем меню
  const onPaneClick = useCallback(() => {
    if (contextMenu) {
      setContextMenu(null)
    }
  }, [contextMenu])

  // Предотвращаем стандартное контекстное меню браузера на canvas
  const onPaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault()
    // Закрываем наше меню при клике правой кнопкой на пустом месте
    setContextMenu(null)
  }, [])

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

  // Открытие диалога удаления
  const handleDeleteSkillClick = useCallback(() => {
    if (contextMenu) {
      setSkillToDelete({
        id: contextMenu.node.id,
        title: contextMenu.node.data.label as string,
      })
      setIsDeleteDialogOpen(true)
      setContextMenu(null)
    }
  }, [contextMenu])

  // Подтверждение удаления навыка
  const handleDeleteSkillConfirm = useCallback(async () => {
    if (!skillToDelete) return

    const isExistingSkill = !skillToDelete.id.startsWith('skill-')

    try {
      if (isExistingSkill) {
        // Удаляем существующий навык через API
        await skillTreeAPI.deleteSkill(skillToDelete.id)
        toast.success('Навык успешно удален')
      } else {
        // Для нового навыка просто удаляем из локального стейта
        toast.success('Навык удален')
      }

      // Удаляем навык из nodes
      setNodes((nds) => nds.filter(node => node.id !== skillToDelete.id))

      // Удаляем связанные edges
      setEdges((eds) => eds.filter(edge =>
        edge.source !== skillToDelete.id && edge.target !== skillToDelete.id
      ))

      setIsDeleteDialogOpen(false)
      setSkillToDelete(null)
    } catch (error) {
      console.error('Ошибка удаления навыка:', error)
      toast.error('Не удалось удалить навык')
    }
  }, [skillToDelete, setNodes, setEdges])

  // Сохранение изменений навыка
  const handleSaveSkill = useCallback(async (data: { title: string; image?: string; imageId?: number }) => {
    if (!editingSkill) return

    // 1. Обновляем ноду локально для мгновенного отклика UI
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

    // 2. НОВОЕ: Немедленно обновляем навык на сервере (только для существующих навыков)
    // Новые навыки имеют временный ID в формате "skill-{timestamp}"
    const isExistingSkill = !editingSkill.id.startsWith('skill-')

    if (isExistingSkill) {
      try {
        await skillTreeAPI.updateSkill(editingSkill.id, {
          title: data.title,
          ...(data.imageId !== undefined && { imageId: data.imageId }),
        })
        console.log('✅ Навык успешно обновлен на сервере:', editingSkill.id)
        toast.success('Навык успешно обновлен')
      } catch (error) {
        console.error('❌ Ошибка обновления навыка:', error)
        toast.error('Не удалось обновить навык на сервере')
      }
    } else {
      // Для новых навыков изменения сохранятся через localStorage и auto-save/publish
      console.log('📝 Новый навык обновлен локально, будет сохранен при публикации')
    }

    setEditingSkill(null)
  }, [editingSkill, setNodes])

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

  // ❌ УДАЛЕНО: Дублирующее сохранение - уже есть в onNodesChange и onEdgesChange
  // Эти useEffect вызывали двойное сохранение и ложные триггеры автосохранения
  // при переключении режимов (mode в зависимостях)

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
        toast.success('Изображение успешно загружено')
      } catch (error) {
        console.error('Ошибка загрузки изображения:', error)
        const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить изображение'
        toast.error(`${errorMessage}. Навык будет создан без изображения.`)
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
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
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
          className="fixed z-[100] bg-background border rounded-lg shadow-xl py-1 min-w-[180px] animate-in fade-in-0 zoom-in-95 duration-100"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2.5"
            onClick={handleEditSkill}
          >
            <Edit className="h-4 w-4" />
            Редактировать навык
          </button>
          <div className="h-px bg-border my-1" />
          <button
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2.5"
            onClick={handleDeleteSkillClick}
          >
            <Trash2 className="h-4 w-4" />
            Удалить навык
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

      {/* Диалог подтверждения удаления навыка */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить навык?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены что хотите удалить навык &quot;{skillToDelete?.title}&quot;?
              Все гайды этого навыка также будут удалены. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSkillConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
