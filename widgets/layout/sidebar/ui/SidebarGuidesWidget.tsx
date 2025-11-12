"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { guideAPI } from "@/entities/guide";
import type { Guide } from "@/entities/guide/model/types";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useSkills } from "@/shared/lib/contexts/SkillsContext";

export function SidebarGuidesWidget() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hoveredGuide, setHoveredGuide] = useState<Guide | null>(null);
  const [mounted, setMounted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { addGuideToFlow, isEditMode } = useSkills();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadGuides = useCallback(
    async (pageNum: number, query: string, isNewSearch: boolean = false) => {
      if (loading || (!hasMore && !isNewSearch)) return;

      setLoading(true);

      // Очищаем результаты при новом поиске
      if (isNewSearch) {
        setGuides([]);
      }

      try {
        if (query.trim()) {
          const result = await guideAPI.searchGuides({
            query: query,
            page: pageNum,
            pageSize: 40,
          });
          setGuides((prev) => {
            if (isNewSearch) return result.data;
            // Фильтруем дубликаты по documentId
            const existingIds = new Set(prev.map((g) => g.documentId));
            const newGuides = result.data.filter(
              (g) => !existingIds.has(g.documentId)
            );
            return [...prev, ...newGuides];
          });
          setHasMore(
            result.meta.pagination.page < result.meta.pagination.pageCount
          );
        } else {
          const result = await guideAPI.getGuides({
            page: pageNum,
            pageSize: 40,
          });
          setGuides((prev) => {
            if (isNewSearch) return result.data;
            // Фильтруем дубликаты по documentId
            const existingIds = new Set(prev.map((g) => g.documentId));
            const newGuides = result.data.filter(
              (g) => !existingIds.has(g.documentId)
            );
            return [...prev, ...newGuides];
          });
          setHasMore(
            result.meta.pagination.page < result.meta.pagination.pageCount
          );
        }
      } catch (error) {
        console.error("Ошибка загрузки гайдов:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore]
  );

  // Загрузка при монтировании
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadGuides(1, "", true);
  }, []);

  // Поиск по нажатию Enter или кнопки
  const handleSearch = () => {
    const query = inputValue.trim();
    setActiveQuery(query);
    setPage(1);
    setHasMore(true);
    loadGuides(1, query, true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setInputValue("");
    setActiveQuery("");
    setPage(1);
    setHasMore(true);
    loadGuides(1, "", true);
  };

  // Обработчик клика на гайд
  const handleGuideClick = (e: React.MouseEvent, guide: Guide) => {
    e.preventDefault(); // Всегда отменяем переход по ссылке

    // Добавляем гайд только если:
    // 1. Функция добавления доступна (мы на странице skills в режиме гайдов)
    // 2. Режим редактирования активен
    if (addGuideToFlow && isEditMode) {
      console.log('🎯 SidebarGuidesWidget: Добавление гайда:', {
        documentId: guide.documentId,
        numericId: guide.id,
        title: guide.title
      });

      addGuideToFlow({
        id: guide.documentId, // ✅ Используем documentId (строка) для ID ноды
        numericId: guide.id,  // ✅ Передаём numeric ID для API операций
        title: guide.title,
        thumbnail: guide.image?.formats?.thumbnail?.url || guide.image?.url,
      });
    }
    // Если нет - ничего не делаем (просто превью при наведении)
  };

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((prev) => {
          const nextPage = prev + 1;
          loadGuides(nextPage, activeQuery);
          return nextPage;
        });
      }
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, activeQuery, loadGuides]);

  return (
    <>
      <SidebarGroup className="relative">
        <SidebarGroupLabel>Гайды</SidebarGroupLabel>
        <SidebarGroupContent className="flex flex-col">
        <div className="px-2 pb-2">
          <div className="relative flex gap-1">
            <div className="relative flex-1">
              <Input
                placeholder="Поиск гайдов..."
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
          {guides.length > 0 ? (
            <>
              <div className="pb-2 flex flex-wrap gap-2 pt-2">
                {guides.map((guide) => (
                  <a
                    key={guide.documentId}
                    href={`/guides/${guide.documentId}`}
                    className="relative w-12 h-12 rounded-full overflow-hidden bg-muted hover:ring-2 hover:ring-gray-500 transition-all"
                    onMouseEnter={() => setHoveredGuide(guide)}
                    onMouseLeave={() => setHoveredGuide(null)}
                    onClick={(e) => handleGuideClick(e, guide)}
                  >
                    {guide.image?.url ? (
                      <Image
                        src={
                          guide.image.formats?.thumbnail?.url || guide.image.url
                        }
                        alt={guide.image.alternativeText || guide.title}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </a>
                ))}
              </div>
              {hasMore && <div ref={loadMoreRef} className="h-4" />}
              {loading && (
                <div className="py-2 text-center text-sm text-muted-foreground">
                  Загрузка...
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-sm text-muted-foreground">
              {loading
                ? "Загрузка..."
                : activeQuery
                ? "Ничего не найдено"
                : "Нет гайдов"}
            </div>
          )}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>

    {/* Превью изображения при наведении - через портал */}
    {mounted && hoveredGuide?.image?.url && createPortal(
      <div className="fixed left-70 top-20 z-50 pointer-events-none">
        <div className="bg-background border rounded-lg shadow-xl p-2">
          <div className="relative w-64 h-64">
            <Image
              src={hoveredGuide.image.url}
              alt={hoveredGuide.image.alternativeText || hoveredGuide.title}
              fill
              className="object-contain rounded"
            />
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
