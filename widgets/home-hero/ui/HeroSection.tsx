"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { SkillTreeMockup } from "./SkillTreeMockup";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white pb-0">
      <div className="container mx-auto px-4 py-6 md:py-16">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1] opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards]">
            Платформа, где обучение становится личным{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              приключением
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards]">
            Anirum — платформа, где ты сам выстраиваешь программу обучения,
            учишься у лучших наставников и растёшь вместе с сообществом.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards]">
            <Button
              size="lg"
              className="group bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all duration-200 h-auto sm:h-12 px-6 py-3 sm:py-0 w-full sm:w-auto"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-0">
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="text-sm sm:text-base">Древо навыков:</span>
                </div>
                <span className="text-sm sm:text-base sm:ml-1">создать программу обучения</span>
                <ArrowRight className="hidden sm:inline w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="group border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 h-auto sm:h-12 px-6 py-3 sm:py-0 w-full sm:w-auto transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-0">
                <span className="text-sm sm:text-base">Курсы:</span>
                <span className="text-sm sm:text-base sm:ml-1">записаться к преподавателю</span>
                <ArrowRight className="hidden sm:inline w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>
          </div>
        </div>

        {/* Skill Tree Mockup with 3D Perspective - Linear Style */}
        <div
          className="relative z-10 max-w-7xl mx-auto opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards]"
          style={{ perspective: "2000px" }}
        >
          <div
            className="transform transition-transform duration-700 hover:scale-[1.02]"
            style={{
              transform: "rotateX(8deg) rotateY(0deg)",
              transformStyle: "flat",
            }}
          >
            <SkillTreeMockup />
          </div>
        </div>    

      </div>
    </section>
  );
}
