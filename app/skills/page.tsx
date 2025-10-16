'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SkillsTreeFlow } from '@/widgets/skills-tree'
import { SkillGuidesFlow, SkillGuidesFlowRef } from '@/widgets/skill-guides'
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
import { ChevronLeft, Home, Eye, Edit } from 'lucide-react'
import { useSkills } from '@/shared/lib/contexts/SkillsContext'
import { useUser } from '@/entities/user'

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

// Данные навыков для разных деревьев (позже вынести в API)
const skillsDataByTree: Record<string, Record<string, any>> = {
  '2d-drawing': {
    'skill-1': { label: 'Основы рисунка', color: '#3b82f6', thumbnail: '/home/features_guide1.jpeg', guideCount: 4 },
    'skill-2': { label: 'Анатомия', color: '#8b5cf6', thumbnail: '/home/features_guide2.jpeg', guideCount: 3 },
    'skill-3': { label: 'Композиция', color: '#ec4899', thumbnail: '/home/features_guide3.jpeg', guideCount: 2 },
    'skill-4': { label: 'Цвет и свет', color: '#f59e0b', thumbnail: '/home/features_guide4.jpeg', guideCount: 3 },
    'skill-5': { label: 'Перспектива', color: '#10b981', thumbnail: '/home/features_guide5.jpeg', guideCount: 2 },
  },
  '3d-modeling': {
    'skill-1': { label: 'Полигональное моделирование', color: '#3b82f6', thumbnail: '/home/features_guide1.jpeg', guideCount: 5 },
    'skill-2': { label: 'Текстурирование', color: '#8b5cf6', thumbnail: '/home/features_guide2.jpeg', guideCount: 4, completed: true },
    'skill-3': { label: 'Sculpting', color: '#ec4899', thumbnail: '/home/features_guide3.jpeg', guideCount: 3 },
    'skill-4': { label: 'UV Mapping', color: '#f59e0b', thumbnail: '/home/features_guide4.jpeg', guideCount: 2, completed: true },
    'skill-5': { label: 'Топология', color: '#10b981', thumbnail: '/home/features_guide5.jpeg', guideCount: 3 },
    'skill-6': { label: 'Hard Surface', color: '#06b6d4', thumbnail: '/home/features_guide1.jpeg', guideCount: 4 },
  },
  'animation': {
    'skill-1': { label: 'Принципы анимации', color: '#3b82f6', thumbnail: '/home/features_guide1.jpeg', guideCount: 3 },
    'skill-2': { label: 'Риггинг', color: '#8b5cf6', thumbnail: '/home/features_guide2.jpeg', guideCount: 4 },
    'skill-3': { label: 'Ключевые кадры', color: '#ec4899', thumbnail: '/home/features_guide3.jpeg', guideCount: 2 },
    'skill-4': { label: 'Motion Capture', color: '#f59e0b', thumbnail: '/home/features_guide4.jpeg', guideCount: 2 },
  },
  'game-design': {
    'skill-1': { label: 'Game Mechanics', color: '#3b82f6', thumbnail: '/home/features_guide1.jpeg', guideCount: 4 },
    'skill-2': { label: 'Level Design', color: '#8b5cf6', thumbnail: '/home/features_guide2.jpeg', guideCount: 3 },
    'skill-3': { label: 'Narrative Design', color: '#ec4899', thumbnail: '/home/features_guide3.jpeg', guideCount: 2 },
    'skill-4': { label: 'Balance & Economy', color: '#f59e0b', thumbnail: '/home/features_guide4.jpeg', guideCount: 3 },
    'skill-5': { label: 'UX/UI Design', color: '#10b981', thumbnail: '/home/features_guide5.jpeg', guideCount: 3 },
  },
  'programming': {
    'skill-1': { label: 'Основы программирования', color: '#3b82f6', thumbnail: '/home/features_guide1.jpeg', guideCount: 5 },
    'skill-2': { label: 'C++ для игр', color: '#8b5cf6', thumbnail: '/home/features_guide2.jpeg', guideCount: 4 },
    'skill-3': { label: 'Unity/C#', color: '#ec4899', thumbnail: '/home/features_guide3.jpeg', guideCount: 4 },
    'skill-4': { label: 'Unreal Engine', color: '#f59e0b', thumbnail: '/home/features_guide4.jpeg', guideCount: 5 },
    'skill-5': { label: 'Shader Programming', color: '#10b981', thumbnail: '/home/features_guide5.jpeg', guideCount: 3 },
    'skill-6': { label: 'Networking', color: '#06b6d4', thumbnail: '/home/features_guide1.jpeg', guideCount: 3 },
    'skill-7': { label: 'AI Programming', color: '#f43f5e', thumbnail: '/home/features_guide2.jpeg', guideCount: 4 },
  },
}

// Данные разных деревьев навыков
const treesData: Record<string, { title: string; thumbnail: string; skillCount: number; guideCount: number }> = {
  '2d-drawing': {
    title: '2D рисование',
    thumbnail: '/home/features_guide1.jpeg',
    skillCount: Object.keys(skillsDataByTree['2d-drawing']).length,
    guideCount: Object.values(skillsDataByTree['2d-drawing']).reduce((sum, skill) => sum + skill.guideCount, 0),
  },
  '3d-modeling': {
    title: '3D моделирование',
    thumbnail: '/home/features_guide2.jpeg',
    skillCount: Object.keys(skillsDataByTree['3d-modeling']).length,
    guideCount: Object.values(skillsDataByTree['3d-modeling']).reduce((sum, skill) => sum + skill.guideCount, 0),
  },
  'animation': {
    title: 'Анимация',
    thumbnail: '/home/features_guide3.jpeg',
    skillCount: Object.keys(skillsDataByTree['animation']).length,
    guideCount: Object.values(skillsDataByTree['animation']).reduce((sum, skill) => sum + skill.guideCount, 0),
  },
  'game-design': {
    title: 'Геймдизайн',
    thumbnail: '/home/features_guide4.jpeg',
    skillCount: Object.keys(skillsDataByTree['game-design']).length,
    guideCount: Object.values(skillsDataByTree['game-design']).reduce((sum, skill) => sum + skill.guideCount, 0),
  },
  'programming': {
    title: 'Программирование',
    thumbnail: '/home/features_guide5.jpeg',
    skillCount: Object.keys(skillsDataByTree['programming']).length,
    guideCount: Object.values(skillsDataByTree['programming']).reduce((sum, skill) => sum + skill.guideCount, 0),
  },
}

// Моковые данные гайдов - должны совпадать с SkillGuidesFlow
const skillGuidesCountMock: Record<string, number> = {
  'skill-1': 4,  // 3D моделирование
  'skill-2': 3,  // Текстурирование
  'skill-3': 1,  // Анимация
  'skill-4': 1,  // Рендеринг
  'skill-5': 1,  // Композитинг
};

// Функция для подсчёта гайдов навыка из localStorage
const countGuidesForSkill = (skillId: string, isCustomTree: boolean, treeId: string): number => {
  if (typeof window === 'undefined') return 0;

  // Для кастомных деревьев читаем из localStorage
  if (isCustomTree) {
    try {
      const stored = localStorage.getItem(`anirum_custom_guides_${skillId}`);
      if (!stored) return 0;
      const guides = JSON.parse(stored);
      return Object.keys(guides).length;
    } catch (error) {
      console.error('Ошибка подсчёта гайдов:', error);
      return 0;
    }
  }

  // Для встроенных деревьев используем моковые данные
  return skillGuidesCountMock[skillId] || 0;
};

// Функция для генерации нод из данных навыков
const generateNodesFromSkills = (skillsData: Record<string, any>, treeId: string, isCustomTree: boolean) => {
  const skills = Object.entries(skillsData)
  const cols = Math.ceil(Math.sqrt(skills.length))

  return skills.map(([id, data], index) => ({
    id,
    type: 'skill',
    data: {
      label: data.label,
      color: data.color,
      thumbnail: data.thumbnail,
      // Подсчитываем реальное количество гайдов
      guideCount: countGuidesForSkill(id, isCustomTree, treeId),
      completed: data.completed || false,
    },
    position: {
      x: (index % cols) * 300 + 100,
      y: Math.floor(index / cols) * 250 + 100,
    },
  }))
}

// Функция для генерации связей между навыками
const generateEdgesFromSkills = (skillIds: string[], treeId: string) => {
  const edges = []
  const cols = Math.ceil(Math.sqrt(skillIds.length)) // Количество колонок в сетке

  // Создаем связи последовательно: слева направо, сверху вниз
  for (let i = 0; i < skillIds.length; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols

    // Связь с навыком справа (в той же строке)
    if (col < cols - 1 && i + 1 < skillIds.length) {
      edges.push({
        id: `e${i}-${i+1}`,
        source: skillIds[i],
        target: skillIds[i + 1],
        type: 'smoothstep',
        style: { strokeWidth: 2 },
      })
    }

    // Связь с навыком снизу (в следующей строке, той же колонке)
    if (i + cols < skillIds.length) {
      edges.push({
        id: `e${i}-${i+cols}`,
        source: skillIds[i],
        target: skillIds[i + cols],
        type: 'smoothstep',
        style: { strokeWidth: 2 },
      })
    }

    // Диагональная связь (вниз-вправо) для красоты
    if (col < cols - 1 && i + cols + 1 < skillIds.length && (i % 3 === 0)) {
      edges.push({
        id: `e${i}-${i+cols+1}`,
        source: skillIds[i],
        target: skillIds[i + cols + 1],
        type: 'smoothstep',
        style: { strokeWidth: 2, strokeDasharray: '5,5' },
      })
    }
  }

  return edges
}

const CUSTOM_TREES_KEY = 'anirum_custom_skill_trees';
const CUSTOM_SKILLS_KEY_PREFIX = 'anirum_custom_skills_';
const CUSTOM_SKILL_EDGES_KEY_PREFIX = 'anirum_custom_skill_edges_';

export default function SkillsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const treeId = searchParams?.get('tree') || '2d-drawing'
  const { user } = useUser()

  // Отслеживаем монтирование для предотвращения гидрации
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Загрузка кастомных деревьев из localStorage
  const loadCustomTree = useCallback((id: string) => {
    if (!isMounted || typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(CUSTOM_TREES_KEY);
      if (!stored) return null;
      const trees = JSON.parse(stored);
      return trees.find((t: any) => t.documentId === id) || null;
    } catch (error) {
      console.error('Ошибка загрузки кастомного дерева:', error);
      return null;
    }
  }, [isMounted]);

  // Загрузка навыков для кастомного дерева
  const loadCustomSkills = useCallback((treeId: string) => {
    if (!isMounted || typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(`${CUSTOM_SKILLS_KEY_PREFIX}${treeId}`);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Ошибка загрузки навыков:', error);
      return {};
    }
  }, [isMounted]);

  // Загрузка связей для кастомного дерева
  const loadCustomEdges = useCallback((treeId: string) => {
    if (!isMounted || typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(`${CUSTOM_SKILL_EDGES_KEY_PREFIX}${treeId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Ошибка загрузки связей:', error);
      return [];
    }
  }, [isMounted]);

  // Проверяем, это кастомное дерево или встроенное
  const isCustomTree = treeId.startsWith('custom-tree-');

  const customTree = useMemo(() => {
    return isCustomTree ? loadCustomTree(treeId) : null;
  }, [isCustomTree, treeId, loadCustomTree]);

  const customSkills = useMemo(() => {
    return isCustomTree ? loadCustomSkills(treeId) : {};
  }, [isCustomTree, treeId, loadCustomSkills]);

  const currentTreeData = useMemo(() => {
    if (isCustomTree && customTree) {
      // Подсчитываем реальное количество гайдов для всех навыков
      const totalGuides = Object.keys(customSkills).reduce((sum: number, skillId: string) => {
        return sum + countGuidesForSkill(skillId, isCustomTree, treeId);
      }, 0);

      return {
        title: customTree.title,
        thumbnail: customTree.thumbnail || '',
        skillCount: Object.keys(customSkills).length,
        guideCount: totalGuides
      }
    }
    return treesData[treeId] || treesData['2d-drawing']
  }, [isCustomTree, customTree, customSkills, treeId]);

  const currentSkillsData = useMemo(() => {
    return isCustomTree
      ? customSkills
      : (skillsDataByTree[treeId] || skillsDataByTree['2d-drawing']);
  }, [isCustomTree, customSkills, treeId]);

  // Генерируем ноды и связи для текущего дерева (мемоизируем для производительности)
  const treeNodes = useMemo(() => {
    if (Object.keys(currentSkillsData).length === 0) return [];
    return generateNodesFromSkills(currentSkillsData, treeId, isCustomTree);
  }, [treeId, currentSkillsData, isCustomTree]);

  const treeEdges = useMemo(() => {
    if (Object.keys(currentSkillsData).length === 0) return [];
    // Для кастомных деревьев загружаем сохранённые связи
    if (isCustomTree) {
      const savedEdges = loadCustomEdges(treeId);
      // Если связей нет, генерируем дефолтные для визуализации
      if (savedEdges.length === 0 && Object.keys(currentSkillsData).length > 1) {
        return generateEdgesFromSkills(Object.keys(currentSkillsData), treeId);
      }
      return savedEdges;
    }
    // Для встроенных деревьев генерируем связи
    return generateEdgesFromSkills(Object.keys(currentSkillsData), treeId);
  }, [treeId, currentSkillsData, isCustomTree]);

  const [view, setView] = useState<ViewState>({ type: 'tree' })
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null)
  const [mode, setMode] = useState<Mode>('view')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const skillGuidesFlowRef = useRef<SkillGuidesFlowRef>(null)
  const { setAddGuideToFlow, setIsSkillMode, setIsOwnTree, setIsEditMode } = useSkills()

  // Определяем, может ли пользователь редактировать текущее дерево
  const canEdit = useMemo(() => {
    if (!user) return false
    // Менеджер может редактировать все
    if (user.role?.name === 'Manager') return true
    // Автор может редактировать свое кастомное дерево
    if (isCustomTree && customTree?.ownerId === user.documentId) return true
    return false
  }, [user, isCustomTree, customTree])

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
      // Получаем актуальные данные дерева напрямую
      const treeData = isCustomTree && customTree
        ? {
            title: customTree.title,
            thumbnail: customTree.thumbnail || '',
            skillCount: Object.keys(customSkills).length,
            // Подсчитываем реальное количество гайдов для всех навыков
            guideCount: Object.keys(customSkills).reduce((sum: number, skillId: string) => {
              return sum + countGuidesForSkill(skillId, isCustomTree, treeId);
            }, 0)
          }
        : (treesData[treeId] || treesData['2d-drawing']);

      setSelectedItem({
        type: 'tree',
        title: treeData.title,
        thumbnail: treeData.thumbnail,
        skillCount: treeData.skillCount,
        guideCount: treeData.guideCount,
      })
    }
  }, [view.type, isMounted, treeId, isCustomTree, customTree, customSkills])

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
    // Используем текущие данные (кастомные или встроенные)
    const skillData = currentSkillsData[skillId]
    if (skillData) {
      setView({
        type: 'skill',
        skillId,
        skillLabel: skillData.label,
        skillColor: skillData.color,
      })
      // Показываем информацию о навыке при открытии
      // Подсчитываем реальное количество гайдов
      const actualGuideCount = countGuidesForSkill(skillId, isCustomTree, treeId);
      setSelectedItem({
        type: 'skill',
        title: skillData.label,
        thumbnail: skillData.thumbnail,
        guideCount: actualGuideCount,
      })
    }
  }, [currentSkillsData, isCustomTree, treeId])

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

  // Обработчик публикации (пока заглушка для фронта)
  const handlePublish = useCallback(() => {
    console.log('Публикация дерева:', treeId)
    // TODO: Здесь будет отправка на бэкенд
    alert('Функция публикации будет реализована после настройки бэкенда')
  }, [treeId])

  // Открыть диалог удаления
  const handleDeleteClick = useCallback(() => {
    setIsDeleteDialogOpen(true)
  }, [])

  // Подтвердить удаление
  const handleDeleteConfirm = useCallback(() => {
    if (view.type === 'tree') {
      // Удаление дерева
      if (isCustomTree) {
        try {
          // Удаляем все навыки дерева
          const skillIds = Object.keys(currentSkillsData)
          skillIds.forEach(skillId => {
            localStorage.removeItem(`anirum_custom_guides_${skillId}`)
            localStorage.removeItem(`anirum_custom_guide_edges_${skillId}`)
          })

          // Удаляем навыки дерева
          localStorage.removeItem(`${CUSTOM_SKILLS_KEY_PREFIX}${treeId}`)

          // Удаляем связи дерева
          localStorage.removeItem(`${CUSTOM_SKILL_EDGES_KEY_PREFIX}${treeId}`)

          // Удаляем дерево из списка
          const stored = localStorage.getItem(CUSTOM_TREES_KEY)
          if (stored) {
            const trees = JSON.parse(stored)
            const updated = trees.filter((t: any) => t.documentId !== treeId)
            localStorage.setItem(CUSTOM_TREES_KEY, JSON.stringify(updated))
          }

          setIsDeleteDialogOpen(false)

          // Отправляем событие для удаления из UI сайдбара
          window.dispatchEvent(new CustomEvent('skill-tree-deleted', {
            detail: { treeId }
          }))

          // Перенаправляем на дефолтное дерево
          router.push('/skills?tree=2d-drawing')
        } catch (error) {
          console.error('Ошибка удаления дерева:', error)
          alert('Произошла ошибка при удалении дерева')
        }
      }
    } else if (view.type === 'skill') {
      // Удаление навыка
      if (isCustomTree) {
        try {
          // Удаляем гайды навыка
          localStorage.removeItem(`anirum_custom_guides_${view.skillId}`)
          localStorage.removeItem(`anirum_custom_guide_edges_${view.skillId}`)

          setIsDeleteDialogOpen(false)

          // Возвращаемся к дереву
          setView({ type: 'tree' })
          setSelectedItem({
            type: 'tree',
            title: currentTreeData.title,
            thumbnail: currentTreeData.thumbnail,
            skillCount: currentTreeData.skillCount,
            guideCount: currentTreeData.guideCount,
          })

          // Обновление дерева произойдет автоматически через reload или обновление state
          window.location.reload()
        } catch (error) {
          console.error('Ошибка удаления навыка:', error)
          alert('Произошла ошибка при удалении навыка')
        }
      }
    }
  }, [view, treeId, isCustomTree, currentSkillsData, currentTreeData, router])

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
            isCustomTree={isCustomTree}
            onPublish={handlePublish}
            onDelete={handleDeleteClick}
          />
        ) : (
          <SkillGuidesFlow
            ref={skillGuidesFlowRef}
            skillId={view.skillId}
            skillData={{
              label: view.skillLabel,
              color: view.skillColor,
            }}
            onItemSelect={handleItemSelect}
            mode={mode}
            shouldShowPublish={view.skillId.startsWith('skill-') && !skillsDataByTree[treeId]?.[view.skillId]}
            onPublish={handlePublish}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* Боковая панель справа */}
      <div className="w-80 border-l bg-background/50 backdrop-blur-sm p-4">
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
    </div>
  )
}