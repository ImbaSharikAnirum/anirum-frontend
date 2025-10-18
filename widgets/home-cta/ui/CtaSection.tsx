"use client";

import React from "react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="relative w-full bg-slate-50 py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Текст */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Создавай свои миры
              <br />
              вместе с нами!
            </h2>
          </div>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors duration-200"
            >
              Записаться к преподавателю
            </Link>
            <Link
              href="/skill-tree"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors duration-200"
            >
              Создать древо навыков
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
