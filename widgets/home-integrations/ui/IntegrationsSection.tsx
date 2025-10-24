"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { User } from "@/entities/user/model/types";

interface PinCardProps {
  pinNumber: number;
}

interface PinterestStatus {
  isConnected: boolean;
  username?: string;
}

interface IntegrationsSectionProps {
  user?: User | null;
  pinterestStatus?: PinterestStatus | null;
}

export function IntegrationsSection({ user, pinterestStatus }: IntegrationsSectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectPinterest = () => {
    if (!user) {
      toast.error("Войдите в систему для подключения Pinterest");
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_PINTEREST_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_PINTEREST_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      const error = "Не настроены параметры Pinterest OAuth";
      console.error(error);
      toast.error(error);
      return;
    }

    try {
      setIsConnecting(true);

      const authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=code&scope=pins:read,boards:read`;

      // Переадресация на Pinterest для авторизации
      window.location.href = authUrl;
    } catch (error) {
      console.error("Ошибка подключения Pinterest:", error);
      toast.error("Не удалось подключиться к Pinterest");
      setIsConnecting(false);
    }
  };
  const PinCard = ({ pinNumber }: PinCardProps) => (
    <div className="relative z-20 size-14 sm:size-20 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Image
        src={`/pinterest/pin${pinNumber}.jpg`}
        alt={`Pinterest pin ${pinNumber}`}
        width={80}
        height={80}
        className="object-cover w-full h-full"
      />
    </div>
  );

  const PinterestIcon = () => (
    <svg
      className="w-8 h-8 sm:w-12 sm:h-12"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );

  return (
    <div className="relative w-full bg-white overflow-hidden py-8 sm:py-12">
      <div className="flex flex-col items-center justify-center">
        <div
          className="group relative mx-auto w-full max-w-xs sm:max-w-md md:max-w-2xl items-center justify-between space-y-4 sm:space-y-6 transition-transform duration-1000 pb-6 sm:pb-8"
          style={{
            transformStyle: "preserve-3d",
            transform: "perspective(1000px) rotateX(0deg) scaleY(1)",
          }}
        >
          {/* Сетка фона */}
          <div
            className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] opacity-30 pointer-events-none"
            style={{ backgroundSize: "16px 16px" }}
          />

          {/* Плавное затухание (горизонталь) */}
          <div
            className="absolute -inset-x-px inset-y-0 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 5%, rgba(255,255,255,0.7) 12%, rgba(255,255,255,0.3) 18%, transparent 28%, transparent 72%, rgba(255,255,255,0.3) 82%, rgba(255,255,255,0.7) 88%, rgba(255,255,255,0.95) 95%, rgba(255,255,255,1) 100%)",
            }}
          />

          {/* Ряд 1 */}
          <div className="overflow-hidden">
            <div
              className="flex w-max animate-scroll-1 gap-6 sm:gap-14"
              style={{ flexDirection: "row" }}
            >
              <PinCard pinNumber={1} />
              <PinCard pinNumber={2} />
              <PinCard pinNumber={3} />
              <PinCard pinNumber={4} />
              <PinCard pinNumber={5} />
              <PinCard pinNumber={6} />
              <PinCard pinNumber={7} />
              <PinCard pinNumber={8} />
              {/* Дубликат для бесшовной анимации */}
              <PinCard pinNumber={1} />
              <PinCard pinNumber={2} />
              <PinCard pinNumber={3} />
              <PinCard pinNumber={4} />
              <PinCard pinNumber={5} />
              <PinCard pinNumber={6} />
              <PinCard pinNumber={7} />
              <PinCard pinNumber={8} />
            </div>
          </div>

          {/* Ряд 2 */}
          <div className="overflow-hidden">
            <div
              className="flex w-max animate-scroll-2 gap-6 sm:gap-14"
              style={{ flexDirection: "row-reverse" }}
            >
              <PinCard pinNumber={9} />
              <PinCard pinNumber={10} />
              <PinCard pinNumber={11} />
              <PinCard pinNumber={12} />
              <PinCard pinNumber={13} />
              <PinCard pinNumber={14} />
              <PinCard pinNumber={15} />
              {/* Дубликат для бесшовной анимации */}
              <PinCard pinNumber={9} />
              <PinCard pinNumber={10} />
              <PinCard pinNumber={11} />
              <PinCard pinNumber={12} />
              <PinCard pinNumber={13} />
              <PinCard pinNumber={14} />
              <PinCard pinNumber={15} />
            </div>
          </div>

          {/* Ряд 3 */}
          <div className="overflow-hidden">
            <div
              className="flex w-max animate-scroll-3 gap-6 sm:gap-14"
              style={{ flexDirection: "row" }}
            >
              <PinCard pinNumber={16} />
              <PinCard pinNumber={17} />
              <PinCard pinNumber={18} />
              <PinCard pinNumber={19} />
              <PinCard pinNumber={20} />
              <PinCard pinNumber={21} />
              <PinCard pinNumber={22} />
              {/* Дубликат для бесшовной анимации */}
              <PinCard pinNumber={16} />
              <PinCard pinNumber={17} />
              <PinCard pinNumber={18} />
              <PinCard pinNumber={19} />
              <PinCard pinNumber={20} />
              <PinCard pinNumber={21} />
              <PinCard pinNumber={22} />
            </div>
          </div>

          {/* Центральная иконка */}
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="flex relative size-16 sm:size-24 rounded-xl sm:rounded-2xl border border-gray-300 bg-white/90 shadow-xl sm:shadow-2xl shadow-gray-400/30 ring-1 ring-gray-200 backdrop-blur-md">
              <div className="m-auto text-red-600">
                <PinterestIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Текстовый блок */}
        <div className="text-center max-w-2xl mx-auto mt-6 sm:mt-8 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
            Подключи свой{" "}
            <span className="text-[#E60023] font-extrabold">Pinterest</span> и
            креативь по любимым референсам
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8">
            Используй пины как гайды для обучения и собирай портфолио прямо в
            профиле
          </p>

          {/* Кнопка подключения Pinterest */}
          <Button
            onClick={connectPinterest}
            disabled={isConnecting || pinterestStatus?.isConnected}
            className="bg-[#E60023] hover:bg-[#AD081B] text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting
              ? "Подключаем..."
              : pinterestStatus?.isConnected
              ? "Pinterest подключен ✓"
              : "Подключить Pinterest"}
          </Button>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .group {
            transform: perspective(1000px) rotateX(35deg) scaleY(0.9) !important;
          }
          .group:hover {
            transform: perspective(1000px) rotateX(0deg) scaleY(1) !important;
          }
        }

        @keyframes scroll1 {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll2 {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes scroll3 {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-1 {
          animation: scroll1 40s linear infinite;
        }

        .animate-scroll-2 {
          animation: scroll2 45s linear infinite;
        }

        .animate-scroll-3 {
          animation: scroll3 50s linear infinite;
        }
      `}</style>
    </div>
  );
}
