"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, BarChart3, X, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/entities/user";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { CreateBranchDialog } from "@/features/branch-create";
import { skillTreeAPI, SkillTree as APISkillTree } from "@/entities/skill-tree";

// Расширяем интерфейс для UI
interface SkillTree extends Partial<APISkillTree> {
  id: string;
  documentId: string;
  title: string;
  thumbnail?: string;
  bookmarked?: boolean;
  createdAt?: string;
  ownerId?: string;  // ID автора дерева
  createdBy?: string; // Имя автора
  isPublic?: boolean; // Публичное или приватное
}

type TreeCategory = 'all' | 'my' | 'bookmarked' | 'popular';

export function SidebarSkillTreesWidget() {
  const router = useRouter();
  const { user } = useUser();
  const [skillTrees, setSkillTrees] = useState<SkillTree[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<TreeCategory>('all');
  const [loading, setLoading] = useState(false);
  const [hoveredTree, setHoveredTree] = useState<SkillTree | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [treeToDelete, setTreeToDelete] = useState<SkillTree | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);


  // Загрузка при монтировании
  useEffect(() => {
    loadSkillTrees("");
  }, []);

  // Слушаем событие удаления дерева
  useEffect(() => {
    const handleTreeDeleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ treeId: string }>;
      const treeId = customEvent.detail.treeId;

      // Удаляем дерево из UI без перезагрузки
      setSkillTrees(prev => prev.filter(tree => tree.documentId !== treeId));
    };

    window.addEventListener('skill-tree-deleted', handleTreeDeleted);
    return () => {
      window.removeEventListener('skill-tree-deleted', handleTreeDeleted);
    };
  }, []);

  const loadSkillTrees = async (query: string, category: TreeCategory = activeCategory) => {
    setLoading(true);
    try {
      // Загружаем деревья из API
      const { skillTrees: apiTrees } = await skillTreeAPI.getSkillTrees({
        pageSize: 100, // Загружаем все деревья
      });

      // Преобразуем API деревья в UI формат
      const treesFromAPI: SkillTree[] = apiTrees.map(tree => ({
        id: tree.id.toString(),
        documentId: tree.documentId,
        title: tree.title,
        thumbnail: tree.image && typeof tree.image === 'object' ? tree.image.url : undefined,
        bookmarked: false, // TODO: добавить в схему Strapi
        createdAt: tree.createdAt,
        ownerId: tree.owner?.documentId,
        createdBy: tree.owner?.username,
        isPublic: !!tree.publishedAt, // Опубликованные деревья считаем публичными
      }));

      // Фильтрация по категории
      let filteredByCategory: SkillTree[] = [];
      switch (category) {
        case 'all':
          filteredByCategory = treesFromAPI;
          break;
        case 'my':
          // Показываем только деревья текущего пользователя
          filteredByCategory = treesFromAPI.filter(tree => tree.ownerId === user?.documentId);
          break;
        case 'bookmarked':
          filteredByCategory = treesFromAPI.filter(tree => tree.bookmarked);
          break;
        case 'popular':
          // Популярные = опубликованные деревья из API
          filteredByCategory = treesFromAPI.filter(tree => tree.isPublic);
          break;
        default:
          filteredByCategory = treesFromAPI;
      }

      // Фильтрация по поисковому запросу
      const filtered = filteredByCategory.filter((tree) =>
        tree.title.toLowerCase().includes(query.toLowerCase())
      );
      setSkillTrees(filtered);
    } catch (error) {
      console.error("Ошибка загрузки деревьев навыков:", error);
      setSkillTrees([]);
    } finally {
      setLoading(false);
    }
  };

  // Поиск по нажатию Enter или кнопки
  const handleSearch = () => {
    const query = inputValue.trim();
    setActiveQuery(query);
    loadSkillTrees(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setInputValue("");
    setActiveQuery("");
    loadSkillTrees("", activeCategory);
  };

  // Переключение категории
  const handleCategoryChange = (category: TreeCategory) => {
    setActiveCategory(category);
    loadSkillTrees(activeQuery, category);
  };

  // Обработчик клика на дерево навыков
  const handleTreeClick = (e: React.MouseEvent, tree: SkillTree) => {
    e.preventDefault();
    e.stopPropagation();
    // SPA-навигация без перезагрузки страницы
    router.push(`/skills?tree=${tree.documentId}`, { scroll: false });
  };

  // Подсчет количества деревьев в категориях из текущего состояния
  const counts = {
    all: skillTrees.length,
    my: skillTrees.filter(tree => tree.ownerId === user?.documentId).length,
    bookmarked: skillTrees.filter(tree => tree.bookmarked).length,
    popular: skillTrees.filter(tree => tree.isPublic).length,
  };

  // Создание нового дерева навыков через API
  const handleCreateTree = async (data: { label: string; thumbnail?: File }) => {
    try {
      const newTree = await skillTreeAPI.createSkillTree({
        title: data.label,
        description: '',
        image: data.thumbnail,
      });

      // Обновляем список
      await loadSkillTrees(activeQuery, activeCategory);

      // Переходим на новое дерево
      router.push(`/skills?tree=${newTree.documentId}`, { scroll: false });
    } catch (error) {
      console.error('Ошибка создания дерева:', error);
      alert('Произошла ошибка при создании дерева навыков');
    }
  };

  // Открыть диалог удаления
  const handleDeleteClick = (e: React.MouseEvent, tree: SkillTree) => {
    e.preventDefault();
    e.stopPropagation();
    setTreeToDelete(tree);
    setIsDeleteDialogOpen(true);
  };

  // Подтвердить удаление дерева через API
  const handleDeleteConfirm = async () => {
    if (!treeToDelete) return;

    try {
      // Удаляем дерево через API
      await skillTreeAPI.deleteSkillTree(treeToDelete.documentId);

      // Обновляем список
      await loadSkillTrees(activeQuery, activeCategory);

      // Закрываем диалог
      setIsDeleteDialogOpen(false);
      setTreeToDelete(null);
    } catch (error) {
      console.error('Ошибка удаления дерева:', error);
      alert('Произошла ошибка при удалении дерева');
    }
  };

  return (
    <>
      <SidebarGroup className="relative">
        <div className="flex items-center justify-between px-2">
          <SidebarGroupLabel>Деревья навыков</SidebarGroupLabel>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsDialogOpen(true)}
            className="h-6 w-6"
            title="Создать дерево навыков"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <SidebarGroupContent className="flex flex-col">
          {/* Табы категорий */}
          <div className="px-2 pb-2 pt-1">
            <div className="flex gap-1 flex-wrap">
              <Button
                size="sm"
                variant={activeCategory === 'all' ? 'default' : 'ghost'}
                onClick={() => handleCategoryChange('all')}
                className="h-7 px-2.5 text-xs"
              >
                Все
              </Button>
              <Button
                size="sm"
                variant={activeCategory === 'my' ? 'default' : 'ghost'}
                onClick={() => handleCategoryChange('my')}
                className="h-7 px-2.5 text-xs"
              >
                Мои
              </Button>
              <Button
                size="sm"
                variant={activeCategory === 'bookmarked' ? 'default' : 'ghost'}
                onClick={() => handleCategoryChange('bookmarked')}
                className="h-7 px-2.5 text-xs"
              >
                Сохранённые
              </Button>
              <Button
                size="sm"
                variant={activeCategory === 'popular' ? 'default' : 'ghost'}
                onClick={() => handleCategoryChange('popular')}
                className="h-7 px-2.5 text-xs gap-1"
              >
                <Star className="h-3 w-3" />
                Популярные
              </Button>
            </div>
          </div>

          {/* Поиск */}
          <div className="px-2 pb-2">
            <div className="relative flex gap-1">
              <div className="relative flex-1">
                <Input
                  placeholder="Поиск деревьев..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-8 h-9"
                />
                {inputValue && (
                  <button
                    onClick={handleClear}
                    className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {inputValue && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSearch}
                  className="px-3 border-gray-300 h-9"
                >
                  Искать
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[300px] px-2 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-foreground/50">
            {skillTrees.length > 0 ? (
              <div className="pb-2 flex flex-wrap gap-2 pt-2">
                {skillTrees.map((tree) => (
                  <a
                    key={tree.id}
                    href={`/skills?tree=${tree.documentId}`}
                    className="relative w-12 h-12 rounded-full overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredTree(tree)}
                    onMouseLeave={() => setHoveredTree(null)}
                    onClick={(e) => handleTreeClick(e, tree)}
                  >
                    {tree.thumbnail ? (
                      <Image
                        src={tree.thumbnail}
                        alt={tree.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div className="py-4 px-2 text-center">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                ) : activeQuery ? (
                  <p className="text-sm text-muted-foreground">Ничего не найдено</p>
                ) : (
                  <div className="space-y-2">
                    {activeCategory === 'my' && (
                      <>
                        <p className="text-sm text-muted-foreground">
                          У вас пока нет своих деревьев
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsDialogOpen(true)}
                          className="gap-2"
                        >
                          <Plus className="h-3 w-3" />
                          Создать первое дерево
                        </Button>
                      </>
                    )}
                    {activeCategory === 'bookmarked' && (
                      <p className="text-sm text-muted-foreground">
                        Сохраняйте деревья для быстрого доступа
                      </p>
                    )}
                    {(activeCategory === 'all' || activeCategory === 'popular') && (
                      <p className="text-sm text-muted-foreground">Нет деревьев</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Превью изображения при наведении - через портал */}
      {mounted &&
        hoveredTree?.thumbnail &&
        createPortal(
          <div className="fixed left-70 top-20 z-50 pointer-events-none">
            <div className="bg-background border rounded-lg shadow-xl p-2">
              <div className="relative w-64 h-64">
                <Image
                  src={hoveredTree.thumbnail}
                  alt={hoveredTree.title}
                  fill
                  className="object-contain rounded"
                />
              </div>
              <p className="text-sm font-medium text-center mt-2">
                {hoveredTree.title}
              </p>
            </div>
          </div>,
          document.body
        )}

      {/* Диалог создания дерева навыков */}
      <CreateBranchDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateTree}
        type="tree"
      />
    </>
  );
}
