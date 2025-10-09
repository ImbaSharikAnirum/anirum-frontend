"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Lock } from "lucide-react";

interface SkillNode {
  id: string;
  name: string;
  level: number;
  status: "completed" | "available" | "locked";
  x: number;
  y: number;
  connections: string[];
}

const skillsData: SkillNode[] = [
  // Level 1 - Основы
  {
    id: "basics-1",
    name: "Основы рисования",
    level: 1,
    status: "completed",
    x: 50,
    y: 20,
    connections: ["anim-1", "design-1"],
  },

  // Level 2
  {
    id: "anim-1",
    name: "2D Анимация",
    level: 2,
    status: "completed",
    x: 30,
    y: 45,
    connections: ["anim-2"],
  },
  {
    id: "design-1",
    name: "UI/UX Design",
    level: 2,
    status: "available",
    x: 70,
    y: 45,
    connections: ["design-2"],
  },

  // Level 3
  {
    id: "anim-2",
    name: "3D Моделирование",
    level: 3,
    status: "available",
    x: 20,
    y: 70,
    connections: ["master-1"],
  },
  {
    id: "design-2",
    name: "Motion Design",
    level: 3,
    status: "locked",
    x: 50,
    y: 70,
    connections: ["master-1"],
  },
  {
    id: "game-1",
    name: "Game Design",
    level: 3,
    status: "locked",
    x: 80,
    y: 70,
    connections: ["master-1"],
  },

  // Level 4 - Мастер
  {
    id: "master-1",
    name: "Senior Animator",
    level: 4,
    status: "locked",
    x: 50,
    y: 95,
    connections: [],
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

  const getNodeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 border-green-400 shadow-green-500/30";
      case "available":
        return "bg-blue-500 border-blue-400 shadow-blue-500/30";
      case "locked":
        return "bg-slate-300 border-slate-200 shadow-slate-300/20";
      default:
        return "bg-slate-300";
    }
  };

  const getNodeIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-white" />;
      case "available":
        return <Circle className="w-5 h-5 text-white" />;
      case "locked":
        return <Lock className="w-4 h-4 text-slate-500" />;
    }
  };

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
    <div className="relative w-full h-[500px] bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl border border-slate-200/50 overflow-visible shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3),0_10px_30px_-10px_rgba(0,0,0,0.2)]">
      {/* Floating Cards */}
      <div className="absolute -top-6 -left-6 bg-white rounded-xl p-4 shadow-xl border border-slate-200 z-20 animate-float">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Завершено курсов</div>
            <div className="text-xl font-bold text-slate-900">12</div>
          </div>
        </div>
      </div>

      <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-xl border border-slate-200 z-20 animate-float delay-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <Circle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xs text-slate-500">В процессе</div>
            <div className="text-xl font-bold text-slate-900">4</div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 left-1/4 bg-white rounded-xl px-4 py-3 shadow-xl border border-slate-200 z-20 animate-float delay-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-slate-700">
            Следующий навык доступен через 2 дня
          </span>
        </div>
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 opacity-30 rounded-2xl overflow-hidden">
        <div className="h-full w-full bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Decorative glow */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-500" />

      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
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

            return (
              <line
                key={`${skill.id}-${targetId}`}
                x1={`${skill.x}%`}
                y1={`${skill.y}%`}
                x2={`${target.x}%`}
                y2={`${target.y}%`}
                stroke={isHighlighted ? "url(#lineGradient)" : "#cbd5e1"}
                strokeWidth={isHighlighted ? "3" : "2"}
                strokeDasharray={skill.status === "locked" ? "5,5" : "0"}
                className="transition-all duration-300"
                opacity={isHighlighted ? "1" : "0.4"}
              />
            );
          })
        )}
      </svg>

      {/* Nodes */}
      <div className="relative h-full" style={{ zIndex: 2 }}>
        {skillsData.map((skill) => {
          const isVisible = visibleNodes.has(skill.id);
          const isHighlighted = isNodeHighlighted(skill.id);

          return (
            <div
              key={skill.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
              } ${isHighlighted ? "scale-110 z-10" : ""}`}
              style={{
                left: `${skill.x}%`,
                top: `${skill.y}%`,
              }}
              onMouseEnter={() => setHoveredNode(skill.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Node */}
              <div
                className={`flex flex-col items-center gap-2 cursor-pointer group ${
                  skill.status !== "locked" ? "hover:scale-110" : ""
                } transition-transform duration-200`}
              >
                <div
                  className={`w-14 h-14 rounded-full border-2 ${getNodeColor(
                    skill.status
                  )} flex items-center justify-center shadow-lg transition-all duration-200 ${
                    isHighlighted ? "ring-4 ring-blue-400/50" : ""
                  }`}
                >
                  {getNodeIcon(skill.status)}
                </div>

                {/* Label */}
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    skill.status === "locked"
                      ? "bg-slate-100 text-slate-500 border border-slate-200"
                      : "bg-white text-slate-700 border border-slate-200 shadow-sm"
                  } ${isHighlighted ? "bg-blue-50 border-blue-200 text-blue-700" : ""}`}
                >
                  {skill.name}
                </div>

                {/* Progress indicator for available/completed */}
                {skill.status !== "locked" && (
                  <div className="w-20 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        skill.status === "completed" ? "bg-green-500 w-full" : "bg-blue-500 w-2/3"
                      } transition-all duration-500`}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-slate-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Завершено</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Доступно</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-300" />
          <span>Заблокировано</span>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-slate-200 shadow-sm z-10">
        <div className="text-xs text-slate-500 mb-1">Прогресс обучения</div>
        <div className="text-2xl font-bold text-slate-900">42%</div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[42%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
