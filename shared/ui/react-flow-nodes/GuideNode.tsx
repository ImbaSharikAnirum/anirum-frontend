"use client";

import { memo, useRef, useEffect, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface GuideNodeData {
  title: string;
  guideId: string;
  thumbnail?: string;
  status?: "not_started" | "in_progress" | "completed";
  difficulty?: "beginner" | "intermediate" | "advanced";
  mode?: "view" | "edit";
  [key: string]: unknown;
}

const statusConfig = {
  not_started: {
    icon: Circle,
    color: "text-white",
    bg: "bg-gray-50",
    border: "border-gray-400",
  },
  in_progress: {
    icon: Clock,
    color: "text-white",
    bg: "bg-blue-50",
    border: "border-gray-400",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-white",
    bg: "bg-green-50",
    border: "border-orange-500",
  },
};

const difficultyConfig = {
  beginner: { label: "Новичок", color: "bg-green-100 text-green-700" },
  intermediate: { label: "Средний", color: "bg-yellow-100 text-yellow-700" },
  advanced: { label: "Продвинутый", color: "bg-red-100 text-red-700" },
};

export const GuideNode = memo(({ data, selected }: NodeProps) => {
  const {
    title,
    thumbnail,
    status = "not_started",
    difficulty,
    mode = "view",
  } = data as GuideNodeData;
  const statusStyle = statusConfig[status];
  const StatusIcon = statusStyle.icon;

  const textRef = useRef<HTMLParagraphElement>(null);
  const [textLines, setTextLines] = useState(1);

  // Определяем количество строк текста
  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(textRef.current).lineHeight
      );
      const height = textRef.current.offsetHeight;
      const lines = Math.round(height / lineHeight);
      setTextLines(lines);
    }
  }, [title]);

  return (
    <div
      className={cn(
        "relative transition-all duration-300 cursor-pointer flex flex-col items-center",
        "hover:scale-105",
        selected && "scale-110"
      )}
      style={{ width: "120px", height: "155px" }}
    >
      <div
        className={cn(
          "rounded-full border-3 transition-all duration-300 overflow-hidden relative",
          statusStyle.border,
          selected ? "ring-4 ring-offset-3 shadow-xl" : "shadow-md"
        )}
        style={{
          width: "120px",
          height: "120px",
          flexShrink: 0,
          ...(selected
            ? ({
                "--tw-ring-color":
                  status === "completed" ? "#f97316" : "#9ca3af",
              } as any)
            : {}),
        }}
      >
        {/* Фоновое изображение */}
        {thumbnail ? (
          <>
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-all duration-500"
              // Закомментировано: фильтр черно-белого при невыполненном гайде
              // className={cn(
              //   "object-cover transition-all duration-500",
              //   // В режиме редактирования всегда цветная
              //   mode === "edit" && "grayscale-0",
              //   // В режиме просмотра зависит от статуса
              //   mode === "view" && status === "not_started" && "grayscale",
              //   mode === "view" &&
              //     status === "in_progress" &&
              //     "grayscale-[50%]",
              //   mode === "view" && status === "completed" && "grayscale-0"
              // )}
            />
            {/* Закомментировано: затемнение для читаемости */}
            {/* {!(status === "completed" || mode === "edit") && (
              <div className="absolute inset-0 bg-black/40" />
            )} */}
          </>
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-3 gap-1"
            style={{ backgroundColor: statusStyle.bg }}
          >
            {/* Сложность для нод без изображения */}
            {difficulty && (
              <div
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  difficultyConfig[difficulty].color
                )}
              >
                {difficultyConfig[difficulty].label}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Текст под кругом - больше отступа при 2 строках */}
      <div className={cn("w-full px-1", textLines === 2 ? "mt-3" : "mt-2")}>
        <p
          ref={textRef}
          className="text-xs font-semibold text-center leading-tight line-clamp-2"
        >
          {title}
        </p>
      </div>

      {/* Handles для связей - нижний handle ниже при 2 строках текста */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          "z-50",
          mode === "edit" ? "w-3 h-3" : "w-1 h-1 opacity-0"
        )}
        style={{
          top: mode === "edit" ? -4 : 0,
          backgroundColor: status === "completed" ? "#f97316" : "#9ca3af",
        }}
        isConnectable={mode === "edit"}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          "z-50",
          mode === "edit" ? "w-3 h-3" : "w-1 h-1 opacity-0"
        )}
        style={{
          bottom: textLines === 2 ? (mode === "edit" ? -15 : -11) : (mode === "edit" ? -0 : 0),
          backgroundColor: status === "completed" ? "#f97316" : "#9ca3af",
        }}
        isConnectable={mode === "edit"}
      />
      <Handle
        type="source"
        position={Position.Left}
        className={cn(
          "z-50",
          mode === "edit" ? "w-3 h-3" : "w-1 h-1 opacity-0"
        )}
        style={{
          left: mode === "edit" ? -4 : 0,
          top: "60px",
          backgroundColor: status === "completed" ? "#f97316" : "#9ca3af",
        }}
        isConnectable={mode === "edit"}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "z-50",
          mode === "edit" ? "w-3 h-3" : "w-1 h-1 opacity-0"
        )}
        style={{
          right: mode === "edit" ? -4 : 0,
          top: "60px",
          backgroundColor: status === "completed" ? "#f97316" : "#9ca3af",
        }}
        isConnectable={mode === "edit"}
      />
    </div>
  );
});

GuideNode.displayName = "GuideNode";
