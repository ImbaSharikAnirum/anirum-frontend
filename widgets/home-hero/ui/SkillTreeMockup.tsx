"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Smile,
  User,
  Zap,
  Hand,
  Box,
  Users,
  Layers,
  UserCircle2,
  Sparkles,
  Target as TargetIcon,
  Blocks,
  BookOpen,
  type LucideIcon
} from "lucide-react";
import Image from "next/image";

interface SkillNode {
  id: string;
  name: string;
  level: number;
  status: "completed" | "available" | "locked";
  x: number;
  y: number;
  connections: string[];
  icon: LucideIcon;
  color: string; // Tailwind bg-color класс
}

const skillsData: SkillNode[] = [
  // Level 4 (Верх)
  {
    id: "pose",
    name: "Позы",
    level: 4,
    status: "available",
    x: 18,
    y: 12,
    connections: ["clothing"],
    icon: Zap,
    color: "bg-slate-400",
  },
  {
    id: "hands",
    name: "Руки и Ноги",
    level: 4,
    status: "available",
    x: 32,
    y: 12,
    connections: ["head"],
    icon: Hand,
    color: "bg-slate-400",
  },
  {
    id: "perspective-advanced",
    name: "Перспектива:\nПродвинутый уровень",
    level: 4,
    status: "available",
    x: 55,
    y: 12,
    connections: ["body"],
    icon: Box,
    color: "bg-slate-400",
  },
  {
    id: "color-advanced",
    name: "Колористика:\nПродвинутый уровень",
    level: 4,
    status: "available",
    x: 80,
    y: 12,
    connections: ["color-base"],
    icon: Sparkles,
    color: "bg-slate-400",
  },

  // Level 3
  {
    id: "clothing",
    name: "Одежда",
    level: 3,
    status: "available",
    x: 16,
    y: 38,
    connections: ["gesture"],
    icon: User,
    color: "bg-slate-400",
  },
  {
    id: "head",
    name: "Голова",
    level: 3,
    status: "available",
    x: 30,
    y: 38,
    connections: ["gesture"],
    icon: Smile,
    color: "bg-slate-400",
  },
  {
    id: "body",
    name: "Тело",
    level: 3,
    status: "available",
    x: 45,
    y: 38,
    connections: ["perspective-base"],
    icon: Zap,
    color: "bg-slate-400",
  },
  {
    id: "color-base",
    name: "Колористика база",
    level: 3,
    status: "available",
    x: 80,
    y: 38,
    connections: ["shadows"],
    icon: Sparkles,
    color: "bg-slate-400",
  },

  // Level 2 (Completed - оранжевая обводка)
  {
    id: "gesture",
    name: "Рисование жестами",
    level: 2,
    status: "completed",
    x: 28,
    y: 60,
    connections: ["forms"],
    icon: Hand,
    color: "bg-[#E17B60]",
  },
  {
    id: "perspective-base",
    name: "Перспектива",
    level: 2,
    status: "completed",
    x: 50,
    y: 60,
    connections: ["forms"],
    icon: Box,
    color: "bg-[#E17B60]",
  },
  {
    id: "shadows",
    name: "Тени",
    level: 2,
    status: "completed",
    x: 72,
    y: 60,
    connections: ["forms"],
    icon: Layers,
    color: "bg-[#E17B60]",
  },

  // Level 1 - Final (Completed)
  {
    id: "forms",
    name: "Формы",
    level: 1,
    status: "completed",
    x: 50,
    y: 85,
    connections: [],
    icon: Blocks,
    color: "bg-[#F3A361]",
  },
];

export function SkillTreeMockup() {
  const [visibleNodes, setVisibleNodes] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    // Анимация появления узлов по очереди
    skillsData.forEach((skill, index) => {
      setTimeout(() => {
        setVisibleNodes((prev) => {
          const newSet = new Set(prev);
          newSet.add(skill.id);
          return newSet;
        });
      }, index * 150);
    });
  }, []);

  const isNodeHighlighted = (nodeId: string) => {
    if (!hoveredNode) return false;
    const node = skillsData.find((n) => n.id === hoveredNode);
    return (
      hoveredNode === nodeId ||
      node?.connections.includes(nodeId) ||
      skillsData.find((n) => n.id === nodeId)?.connections.includes(hoveredNode)
    );
  };

  return (
    <div className="px-1 sm:px-0">
      <div
        className="relative w-full h-[500px] bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl border border-slate-200/50 overflow-hidden sm:overflow-visible shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3),0_10px_30px_-10px_rgba(0,0,0,0.2)]"
        style={{ transformStyle: "flat" }}
      >
      {/* Floating Cards */}
      <div className="absolute top-3 left-3 sm:-top-6 sm:-left-6 bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-lg sm:shadow-xl border border-slate-200 z-20 animate-float">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
            <div className="relative w-5 h-5 sm:w-8 sm:h-8 rounded sm:rounded-lg overflow-hidden border border-slate-200">
              <Image
                src="/directions/2D.png"
                alt="2D Direction"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative w-5 h-5 sm:w-8 sm:h-8 rounded sm:rounded-lg overflow-hidden border border-slate-200">
              <Image
                src="/directions/3D.png"
                alt="3D Direction"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative w-5 h-5 sm:w-8 sm:h-8 rounded sm:rounded-lg overflow-hidden border border-slate-200">
              <Image
                src="/directions/animation.jpg"
                alt="Animation Direction"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <div className="text-[9px] sm:text-xs text-slate-500">Создавай своё древо</div>
            <div className="text-[11px] sm:text-sm font-semibold text-slate-900">или используй существующие</div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-3 sm:top-auto sm:translate-y-0 sm:-top-6 sm:-right-6 bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-lg sm:shadow-xl border border-slate-200 z-20 animate-float delay-200">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="relative w-8 h-10 sm:w-12 sm:h-16 flex-shrink-0">
            <Image
              src="/home/features_guide5.jpeg"
              alt="Guide"
              fill
              className="object-cover rounded sm:rounded-md border border-slate-200 shadow-sm"
            />
          </div>
          <div>
            <div className="text-[9px] sm:text-xs text-slate-500">Используй гайды</div>
            <div className="text-[11px] sm:text-sm font-semibold text-slate-900">для создания древа</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 sm:-bottom-6 sm:left-[10%] bg-white rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-4 sm:py-3 shadow-lg sm:shadow-xl border border-slate-200 z-20 animate-float delay-500">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0 overflow-hidden border sm:border-2 border-green-500">
            <Image
              src="/home/features_avatar1.jpg"
              alt="User Profile"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <span className="text-[11px] sm:text-sm font-medium text-slate-700">
              Выполняй древо и храни результат у себя в профиле
            </span>
          </div>
        </div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 opacity-30 rounded-2xl overflow-hidden">
        <div className="h-full w-full bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Decorative glow */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-500" />

      <svg className="absolute inset-0 w-full h-full px-4 sm:px-0" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Connections */}
        {skillsData.map((skill) =>
          skill.connections.map((targetId) => {
            const target = skillsData.find((s) => s.id === targetId);
            if (!target || !visibleNodes.has(skill.id) || !visibleNodes.has(targetId))
              return null;

            const isHighlighted =
              isNodeHighlighted(skill.id) || isNodeHighlighted(targetId);

            // Если оба узла completed - линия оранжевая
            const bothCompleted = skill.status === "completed" && target.status === "completed";
            const lineColor = bothCompleted ? "#f97316" : (isHighlighted ? "url(#lineGradient)" : "#cbd5e1");

            return (
              <line
                key={`${skill.id}-${targetId}`}
                x1={`${skill.x}%`}
                y1={`${skill.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke={lineColor}
                strokeWidth={bothCompleted ? "2" : (isHighlighted ? "2" : "1.5")}
                className="transition-all duration-300 sm:[stroke-width:3] sm:[&.highlighted]:[stroke-width:3]"
                opacity={bothCompleted ? "0.8" : (isHighlighted ? "1" : "0.4")}
              />
            );
          })
        )}
      </svg>

      {/* Nodes */}
      <div className="relative h-full px-4 sm:px-0" style={{ zIndex: 2 }}>
        {skillsData.map((skill) => {
          const isVisible = visibleNodes.has(skill.id);
          const isHighlighted = isNodeHighlighted(skill.id);
          const isHovered = hoveredNode === skill.id;

          // Определяем цвет фона узла
          const bgColor = skill.status === "available" ? "bg-slate-400" : skill.color;

          // Определяем цвет border
          const borderColor = skill.status === "completed" ? "border-orange-500" : "border-white/50";

          // Определяем ring (обводку)
          let ringClass = "";
          if (skill.status === "completed") {
            // Для completed: оранжевый по умолчанию, синий при hover
            ringClass = isHighlighted ? "ring-2 sm:ring-4 ring-blue-400/50" : "ring-2 sm:ring-4 ring-orange-400/30";
          } else {
            // Для available: синий только при hover
            ringClass = isHighlighted ? "ring-2 sm:ring-4 ring-blue-400/50" : "";
          }

          const IconComponent = skill.icon;

          return (
            <div
              key={skill.id}
              className="absolute cursor-pointer transition-all duration-200"
              style={{
                left: `${skill.x}%`,
                top: `${skill.y}%`,
                transform: `translate(-50%, -50%) scale(${
                  !isVisible ? 0.5 : isHovered ? 1.1 : 1
                })`,
                opacity: isVisible ? 1 : 0,
                zIndex: isHovered ? 10 : 2,
              }}
              onMouseEnter={() => setHoveredNode(skill.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                {/* Node Circle */}
                <div
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full border sm:border-2 ${bgColor} ${borderColor} ${ringClass} shadow-md sm:shadow-lg flex items-center justify-center transition-all duration-200`}
                >
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>

                {/* Label */}
                <div
                  className="px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded sm:rounded-lg text-[9px] sm:text-xs font-medium text-center max-w-[65px] sm:max-w-none transition-all duration-200 bg-white text-slate-700 border border-slate-200 shadow-sm leading-tight"
                >
                  {skill.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      </div>
    </div>
  );
}
