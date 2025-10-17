'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SkillsTreeFlow, getLocalDraft, clearLocalDraft } from '@/widgets/skills-tree'
import { SkillGuidesFlow, SkillGuidesFlowRef, getLocalGuides, clearLocalGuides } from '@/widgets/skill-guides'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { ChevronLeft, Home, Eye, Edit, Loader2 } from 'lucide-react'
import { useSkills } from '@/shared/lib/contexts/SkillsContext'
import { useUser } from '@/entities/user'
import { SkillTree, publishSkillTree, PublishProgress } from '@/entities/skill-tree'
import type { Node, Edge } from '@xyflow/react'

type ViewState =
  | { type: 'tree' }
  | { type: 'skill'; skillId: string; skillLabel: string; skillColor: string }

type Mode = 'view' | 'edit'

type SelectedItem = {
  type: 'tree' | 'skill' | 'guide'
  title: string
  thumbnail?: string
  skillCount?: number
  guideCount?: number
} | null

export default function SkillsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const treeId = searchParams?.get('tree')
  const { user } = useUser()

  // Отслеживаем монтирование для предотвращения гидрации
  const [isMounted, setIsMounted] = useState(false)
  const [apiTree, setApiTree] = useState<SkillTree | null>(null)
  const [loadingTree, setLoadingTree] = useState(false)
  const [localStorageVersion, setLocalStorageVersion] = useState(0) // Триггер для обновления

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Загрузка дерева из API
  useEffect(() => {
    if (!isMounted || !treeId) return;

    const loadTree = async () => {
      setLoadingTree(true);
      try {
        // Временный импорт для загрузки
        const { skillTreeAPI } = await import('@/entities/skill-tree');
        const tree = await skillTreeAPI.getSkillTree(treeId);
        setApiTree(tree);
      } catch (error) {
        console.error('Ошибка загрузки дерева:', error);
        setApiTree(null);
      } finally {
        setLoadingTree(false);
      }
    };

    loadTree();
  }, [treeId, isMounted]);

  // Определяем данные текущего дерева
  const currentTreeData = useMemo(() => {
    if (apiTree) {
      return {
        title: apiTree.title,
        thumbnail: apiTree.image && typeof apiTree.image === 'object' ? apiTree.image.url : '',
        skillCount: apiTree.skills?.length || 0,
        guideCount: apiTree.skills?.reduce((sum, skill) => sum + (skill.guides?.length || 0), 0) || 0,
      };
    }
    return { title: '', thumbnail: '', skillCount: 0, guideCount: 0 };
  }, [apiTree]);

  // Слушатель изменений localStorage для реактивного обновления
  useEffect(() => {
    if (!treeId) return;

    const handleStorageChange = () => {
      setLocalStorageVersion(v => v + 1);
    };

    // Слушаем события storage (работает между вкладками)
    window.addEventListener('storage', handleStorageChange);

    // Для изменений в той же вкладке используем кастомное событие
    window.addEventListener('local-draft-updated', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-draft-updated', handleStorageChange as EventListener);
    };
  }, [treeId]);

  // Генерируем ноды для текущего дерева (API + локальные черновики)
  const treeNodes = useMemo(() => {
    // 1. Загружаем ноды из API
    let nodes: Node[] = [];

    if (apiTree && apiTree.skills && apiTree.skills.length > 0) {
      nodes = apiTree.skills.map(skill => ({
        id: skill.documentId,
        type: 'skill',
        data: {
          label: skill.title,
          thumbnail: skill.image && typeof skill.image === 'object' ? skill.image.url : undefined,
          guideCount: skill.guides?.length || 0,
          completed: false,
        },
        position: skill.position || { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      }));
    }

    // 2. Если есть локальные изменения, используем их
    if (treeId) {
      const localDraft = getLocalDraft(treeId);
      if (localDraft.nodes && localDraft.nodes.length > 0) {
        nodes = localDraft.nodes;
      }
    }

    return nodes;
  }, [apiTree, treeId, localStorageVersion]);

  // Определяем данные навыков текущего дерева (API + локальные из treeNodes)
  const currentSkillsData = useMemo(() => {
    const skillsMap: Record<string, any> = {};

    // Используем treeNodes, который уже содержит как API, так и локальные навыки
    treeNodes.forEach(node => {
      skillsMap[node.id] = {
        label: node.data.label,
        thumbnail: node.data.thumbnail,
        guideCount: node.data.guideCount || 0,
      };
    });

    return skillsMap;
  }, [treeNodes]);

  const treeEdges = useMemo(() => {
    if (!apiTree) return [];

    // Используем связи из базы
    if (apiTree.skillEdges && apiTree.skillEdges.length > 0) {
      return apiTree.skillEdges;
    }

    // Если связей нет, возвращаем пустой массив
    return [];
  }, [apiTree]);

  const [view, setView] = useState<ViewState>({ type: 'tree' })
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null)
  const [mode, setMode] = useState<Mode>('view')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [publishProgress, setPublishProgress] = useState<PublishProgress | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  const skillGuidesFlowRef = useRef<SkillGuidesFlowRef>(null)
  const { setAddGuideToFlow, setIsSkillMode, setIsOwnTree, setIsEditMode } = useSkills()

  // Определяем, может ли пользователь редактировать текущее дерево
  const canEdit = useMemo(() => {
    if (!user) return false
    // Менеджер может редактировать все
    if (user.role?.name === 'Manager') return true
    // Автор может редактировать свое дерево из API
    if (apiTree && apiTree.owner?.documentId === user.documentId) return true
    return false
  }, [user, apiTree])

  // При смене дерева - всегда устанавливаем режим просмотра и флаг isOwnTree
  useEffect(() => {
    setMode('view') // Всегда начинаем с режима просмотра
    setIsOwnTree(canEdit)
  }, [canEdit, treeId, setIsOwnTree])

  // Обновляем isEditMode в контексте при смене режима
  useEffect(() => {
    setIsEditMode(mode === 'edit')
  }, [mode, setIsEditMode])

  // Сброс режима при смене дерева навыков
  useEffect(() => {
    setView({ type: 'tree' })
    setSelectedItem(null)
  }, [treeId])

  // Автоматически показываем информацию о дереве при переходе в режим tree
  useEffect(() => {
    if (view.type === 'tree' && isMounted) {
      setSelectedItem({
        type: 'tree',
        title: currentTreeData.title,
        thumbnail: currentTreeData.thumbnail,
        skillCount: currentTreeData.skillCount,
        guideCount: currentTreeData.guideCount,
      })
    }
  }, [view.type, isMounted, currentTreeData])

  // Обновляем функцию добавления и режим в контексте при смене режима
  useEffect(() => {
    if (view.type === 'skill' && skillGuidesFlowRef.current) {
      setAddGuideToFlow(() => skillGuidesFlowRef.current!.addGuide)
      setIsSkillMode(true)
    } else {
      setAddGuideToFlow(null)
      setIsSkillMode(false)
    }
  }, [view, setAddGuideToFlow, setIsSkillMode])

  const handleSkillOpen = useCallback((skillId: string) => {
    const skillData = currentSkillsData[skillId]
    if (skillData) {
      setView({
        type: 'skill',
        skillId,
        skillLabel: skillData.label,
        skillColor: '#3b82f6', // Дефолтный цвет для совместимости
      })
      setSelectedItem({
        type: 'skill',
        title: skillData.label,
        thumbnail: skillData.thumbnail,
        guideCount: skillData.guideCount || 0,
      })
    } else {
      console.error('Навык не найден:', skillId)
    }
  }, [currentSkillsData])

  const handleBackToTree = useCallback(() => {
    setView({ type: 'tree' })
    // Возвращаем информацию о древе
    setSelectedItem({
      type: 'tree',
      title: currentTreeData.title,
      thumbnail: currentTreeData.thumbnail,
      skillCount: currentTreeData.skillCount,
      guideCount: currentTreeData.guideCount,
    })
  }, [currentTreeData])

  const handleItemSelect = useCallback((item: SelectedItem) => {
    setSelectedItem(item)
  }, [])

  // Обработчик публикации - отправка локальных изменений на сервер
  const handlePublish = useCallback(async () => {
    if (!treeId || !apiTree || isPublishing) return;

    // Получаем локальные изменения дерева навыков
    const localDraft = getLocalDraft(treeId);

    // Получаем локальные изменения гайдов (если мы в режиме skill)
    let localGuides = { nodes: null as any, edges: null as any };
    let currentSkillId: string | undefined;

    if (view.type === 'skill') {
      currentSkillId = view.skillId;
      localGuides = getLocalGuides(view.skillId);
    }

    // Проверяем наличие изменений
    const hasTreeChanges = localDraft.nodes || localDraft.edges;
    const hasGuideChanges = localGuides.nodes || localGuides.edges;

    if (!hasTreeChanges && !hasGuideChanges) {
      alert('Нет локальных изменений для публикации');
      return;
    }

    setIsPublishing(true);

    console.log('🎯 Публикация - данные перед отправкой:');
    console.log('🎯 view.type:', view.type);
    console.log('🎯 currentSkillId:', currentSkillId);
    console.log('🎯 localGuides.nodes:', localGuides.nodes?.length);
    console.log('🎯 localGuides.edges:', localGuides.edges?.length);
    console.log('🎯 localDraft.nodes:', localDraft.nodes?.length);
    console.log('🎯 localDraft.edges:', localDraft.edges?.length);

    try {
      // Используем централизованную функцию публикации
      const result = await publishSkillTree(
        treeId,
        apiTree,
        localDraft.nodes || [],
        localDraft.edges || [],
        setPublishProgress, // Callback для отображения прогресса
        // Опциональные параметры для гайдов
        currentSkillId,
        localGuides.nodes || undefined,
        localGuides.edges || undefined
      );

      if (result.success && result.tree) {
        // Обновляем состояние без перезагрузки страницы
        setApiTree(result.tree);

        // Очищаем локальные черновики
        if (hasTreeChanges) {
          clearLocalDraft(treeId);
        }
        if (hasGuideChanges && currentSkillId) {
          clearLocalGuides(currentSkillId);
        }

        setPublishProgress(null);
        alert('✅ Изменения успешно опубликованы!');
      } else {
        alert(`❌ Ошибка публикации: ${result.error}`);
      }
    } catch (error) {
      console.error('Ошибка публикации:', error);
      alert('❌ Произошла ошибка при публикации изменений');
    } finally {
      setIsPublishing(false);
      setPublishProgress(null);
    }
  }, [treeId, apiTree, isPublishing, view])

  // Открыть диалог удаления
  const handleDeleteClick = useCallback(() => {
    setIsDeleteDialogOpen(true)
  }, [])

  // Подтвердить удаление через API
  const handleDeleteConfirm = useCallback(async () => {
    if (!treeId) return;

    if (view.type === 'tree') {
      // Удаление дерева
      if (apiTree) {
        try {
          const { skillTreeAPI } = await import('@/entities/skill-tree');
          await skillTreeAPI.deleteSkillTree(treeId);
          setIsDeleteDialogOpen(false);

          // Отправляем событие для удаления из UI сайдбара
          window.dispatchEvent(new CustomEvent('skill-tree-deleted', {
            detail: { treeId }
          }));

          // Перенаправляем на страницу выбора дерева
          router.push('/skills');
        } catch (error) {
          console.error('Ошибка удаления дерева:', error);
          alert('Произошла ошибка при удалении дерева');
        }
      }
    } else if (view.type === 'skill') {
      // Удаление навыка через API
      if (apiTree) {
        try {
          const { skillTreeAPI } = await import('@/entities/skill-tree');
          await skillTreeAPI.deleteSkill(view.skillId);
          setIsDeleteDialogOpen(false);

          // Возвращаемся к дереву
          setView({ type: 'tree' });
          setSelectedItem({
            type: 'tree',
            title: currentTreeData.title,
            thumbnail: currentTreeData.thumbnail,
            skillCount: currentTreeData.skillCount,
            guideCount: currentTreeData.guideCount,
          });

          // Перезагружаем дерево
          window.location.reload();
        } catch (error) {
          console.error('Ошибка удаления навыка:', error);
          alert('Произошла ошибка при удалении навыка');
        }
      }
    }
  }, [view, treeId, apiTree, currentTreeData, router])

  // Получаем текст для диалога в зависимости от типа удаления
  const deleteDialogContent = useMemo(() => {
    if (view.type === 'tree') {
      return {
        title: 'Удалить дерево навыков?',
        description: 'Вы уверены что хотите удалить это дерево? Все навыки и гайды будут удалены. Это действие нельзя отменить.',
      }
    } else if (view.type === 'skill') {
      return {
        title: 'Удалить навык?',
        description: 'Вы уверены что хотите удалить этот навык? Все гайды навыка будут удалены. Это действие нельзя отменить.',
      }
    }
    return { title: '', description: '' }
  }, [view])

  // Не рендерим до монтирования чтобы избежать гидрации
  if (!isMounted) {
    return (
      <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px-73px)] flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  // Показываем загрузку дерева
  if (loadingTree) {
    return (
      <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px-73px)] flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка дерева навыков...</div>
      </div>
    )
  }

  // Если дерево не найдено
  if (!apiTree && treeId) {
    return (
      <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px-73px)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Дерево навыков не найдено</p>
          <Button onClick={() => router.push('/skills')}>
            Вернуться к списку
          </Button>
        </div>
      </div>
    )
  }

  // Если не выбрано дерево
  if (!treeId) {
    return (
      <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px-73px)] flex items-center justify-center">
        <div className="text-muted-foreground">Выберите дерево навыков из списка</div>
      </div>
    )
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px-73px)] flex">
      {/* Основная область с ReactFlow */}
      <div className="flex-1 relative">
        {/* Breadcrumbs / Навигация */}
        {view.type === 'skill' && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToTree}
              className="gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
              <ChevronLeft className="h-4 w-4" />
              Назад к древу навыков
            </Button>
            <div className="px-3 py-1.5 rounded-md text-sm font-medium bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border flex items-center gap-2">
              {selectedItem?.type === 'skill' && selectedItem.thumbnail && (
                <div className="w-6 h-6 rounded-full overflow-hidden border border-foreground/30">
                  <img
                    src={selectedItem.thumbnail}
                    alt={view.skillLabel}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {view.skillLabel}
            </div>

            {/* Переключатель режимов - показываем если пользователь может редактировать */}
            {canEdit && (
              <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
                <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <TabsTrigger value="view" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Просмотр
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="gap-1.5">
                    <Edit className="h-3.5 w-3.5" />
                    Редактирование
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        )}

        {view.type === 'tree' && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-md text-sm font-medium bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border flex items-center gap-2">
              {currentTreeData.thumbnail && (
                <div className="w-6 h-6 rounded-full overflow-hidden border border-foreground/30">
                  <img
                    src={currentTreeData.thumbnail}
                    alt={currentTreeData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Home className="h-4 w-4" />
              {currentTreeData.title}
            </div>

            {/* Переключатель режимов - показываем только если пользователь может редактировать */}
            {canEdit && (
              <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
                <TabsList className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <TabsTrigger value="view" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Просмотр
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="gap-1.5">
                    <Edit className="h-3.5 w-3.5" />
                    Редактирование
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        )}

        {/* Условный рендер ReactFlow */}
        {view.type === 'tree' ? (
          <SkillsTreeFlow
            key={treeId}
            treeId={treeId}
            onSkillOpen={handleSkillOpen}
            onItemSelect={handleItemSelect}
            initialNodes={treeNodes}
            initialEdges={treeEdges}
            mode={mode}
            isCustomTree={!!apiTree}
            onPublish={handlePublish}
            onDelete={handleDeleteClick}
          />
        ) : (
          <SkillGuidesFlow
            key={`${view.skillId}-${apiTree?.updatedAt || ''}`}
            ref={skillGuidesFlowRef}
            skillId={view.skillId}
            skillData={{
              label: view.skillLabel,
              color: view.skillColor,
            }}
            onItemSelect={handleItemSelect}
            mode={mode}
            shouldShowPublish={!!apiTree}
            onPublish={handlePublish}
            onDelete={handleDeleteClick}
            apiGuides={apiTree?.skills?.find(s => s.documentId === view.skillId)?.guides}
            apiGuideEdges={apiTree?.skills?.find(s => s.documentId === view.skillId)?.guideEdges}
          />
        )}
      </div>

      {/* Боковая панель справа - скрыта на мобильных */}
      <div className="hidden md:block w-80 border-l bg-background/50 backdrop-blur-sm p-4">
        {selectedItem ? (
          <div className="space-y-4">
            {selectedItem.thumbnail && (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <img
                  src={selectedItem.thumbnail}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="space-y-3">
              {/* Тип элемента */}
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {selectedItem.type === 'tree' && 'Древо навыков'}
                  {selectedItem.type === 'skill' && 'Навык'}
                  {selectedItem.type === 'guide' && 'Гайд'}
                </span>
              </div>

              <h3 className="text-lg font-semibold">{selectedItem.title}</h3>

              {selectedItem.type === 'tree' && (
                <div className="space-y-1">
                  {selectedItem.skillCount !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      Навыков: {selectedItem.skillCount}
                    </p>
                  )}
                  {selectedItem.guideCount !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      Гайдов: {selectedItem.guideCount}
                    </p>
                  )}
                </div>
              )}

              {selectedItem.type === 'skill' && selectedItem.guideCount !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Гайдов: {selectedItem.guideCount}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Выберите элемент для просмотра
          </div>
        )}
      </div>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteDialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Индикатор прогресса публикации */}
      {isPublishing && publishProgress && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <h3 className="font-semibold text-lg">Публикация изменений</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{publishProgress.status}</span>
                <span className="font-medium">
                  {publishProgress.current} / {publishProgress.total}
                </span>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(publishProgress.current / publishProgress.total) * 100}%`,
                  }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Пожалуйста, не закрывайте страницу
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}