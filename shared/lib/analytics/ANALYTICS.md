# 📊 Analytics Documentation

Документация по системе аналитики для Anirum Platform.

---

## 🏗️ Архитектура

### **Мульти-провайдерная система**

```
shared/lib/analytics/
  ├── types.ts                    # Базовые типы
  ├── events.ts                   # События и их свойства
  ├── analytics-manager.ts        # Главный менеджер
  ├── index.ts                    # Public API
  └── providers/
      ├── base.ts                 # IAnalyticsProvider интерфейс
      ├── mixpanel.ts             # Mixpanel провайдер
      ├── google-analytics.ts     # Google Analytics 4
      └── index.ts                # Экспорт провайдеров
```

### **Принцип работы:**

1. **Единая точка входа:** Все события отправляются через `analytics.track()`
2. **Автоматическая маршрутизация:** Менеджер отправляет события во все активные провайдеры
3. **Error Isolation:** Падение одного провайдера не влияет на остальные
4. **Type Safety:** TypeScript валидирует названия событий и их properties

---

## 🎯 События

### **Список событий:**

На данный момент события не определены. Добавляй их по мере необходимости через файл `events.ts`.

---

## 🚀 Использование

### **1. В React компонентах (рекомендуется)**

```typescript
import { useAnalytics } from '@/shared/hooks/useAnalytics'
import { AnalyticsEvent } from '@/shared/lib/analytics'

export function SomeComponent() {
  const { track, identify } = useAnalytics()

  const handleAction = async () => {
    // Идентифицируем пользователя
    identify(user.documentId, {
      email: user.email,
      username: user.username,
      role: user.role.type
    })

    // Трекаем событие (когда добавишь события)
    // track(AnalyticsEvent.YOUR_EVENT, { ... })
  }

  return <div>...</div>
}
```

### **2. Напрямую (без хука)**

```typescript
import { analytics, AnalyticsEvent } from '@/shared/lib/analytics'

// В любом контексте (не только React)
// analytics.track(AnalyticsEvent.YOUR_EVENT, { ... })
```

---

## ➕ Как добавить новое событие

### **Шаг 1: Добавить в enum**

Файл: `shared/lib/analytics/events.ts`

```typescript
export enum AnalyticsEvent {
  // Новое событие
  MY_EVENT = 'My Event',
}
```

### **Шаг 2: Определить properties**

```typescript
export interface EventProperties {
  [AnalyticsEvent.MY_EVENT]: {
    property1: string
    property2: number
    property3?: boolean
  } & EventPropertiesBase
}
```

### **Шаг 3: Использовать**

```typescript
track(AnalyticsEvent.MY_EVENT, {
  property1: 'value',
  property2: 123,
  property3: true
})
```

TypeScript автоматически подскажет доступные properties! ✅

---

## 📊 Провайдеры

### **Mixpanel** 🔵

**Фокус:** Product Analytics, Retention, Cohorts

**Используется для:**
- User journey tracking
- Retention analysis
- Cohort analysis
- Revenue per user
- Feature adoption

**События:**
- ✅ Все Acquisition события
- ✅ Все Activation события
- ✅ Все Engagement события
- ✅ Все Conversion события

### **Google Analytics 4** 🔴

**Фокус:** Marketing Attribution, Traffic Analysis

**Используется для:**
- UTM tracking
- SEO performance
- Landing page optimization
- Marketing campaign ROI
- Audience для ремаркетинга

**События:**
- ✅ Acquisition (с UTM метками)
- ✅ Conversion (для Google Ads)
- ✅ Pageviews
- ❌ Детальные product events (не нужно)

---

## 🔍 Дебаг

### **Проверка инициализации**

Открой консоль браузера, должны появиться логи:

```
✅ Mixpanel инициализирован
✅ Google Analytics инициализирован
✅ Analytics Manager инициализирован с 2 провайдерами
```

### **Проверка отправки событий**

**DevTools → Network:**
- Фильтр `mixpanel.com` - события Mixpanel
- Фильтр `google-analytics.com` - события GA4

**Консоль:**
```typescript
// Включить debug режим
localStorage.setItem('debug', 'analytics:*')

// Отправить тестовое событие (когда добавишь события)
// analytics.track(AnalyticsEvent.YOUR_EVENT, { ... })
```

### **Проверка активных провайдеров**

```typescript
console.log(analytics.getActiveProviders())
// → ['Mixpanel', 'Google Analytics']
```

---

## ⚠️ Best Practices

### **1. Всегда используй enum**

❌ **Плохо:**
```typescript
track('my_event', { prop: 'value' })
```

✅ **Хорошо:**
```typescript
track(AnalyticsEvent.MY_EVENT, { prop: 'value' })
```

### **2. Identify пользователей при логине**

```typescript
useEffect(() => {
  if (user) {
    identify(user.documentId, {
      email: user.email,
      role: user.role.type,
      signup_date: user.createdAt
    })
  }
}, [user])
```

### **3. Не спамить событиями**

❌ **Плохо:**
```typescript
// Каждый клик, каждый hover
onClick={() => track(AnalyticsEvent.BUTTON_CLICKED)}
```

✅ **Хорошо:**
```typescript
// Только значимые действия
onSubmit={() => track(AnalyticsEvent.FORM_SUBMITTED, { ... })}
```

### **4. Обогащать события контекстом**

✅ **Хорошо:**
```typescript
track(AnalyticsEvent.MY_EVENT, {
  context_property1: 'value',
  context_property2: 123,
  referrer: document.referrer
})
```

---

## 🛠️ Troubleshooting

### **Проблема: События не отправляются**

**Решение:**
1. Проверь что провайдеры инициализированы (логи в консоли)
2. Проверь env переменные (`NEXT_PUBLIC_MIXPANEL_TOKEN`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`)
3. Проверь Network в DevTools

### **Проблема: TypeScript ошибки**

**Решение:**
1. Убедись что импортируешь `AnalyticsEvent` из `@/shared/lib/analytics`
2. Проверь что properties соответствуют типам в `events.ts`

### **Проблема: GA4 не инициализируется**

**Решение:**
1. Проверь что `gtag` загружен через Script в `layout.tsx`
2. Проверь что `NEXT_PUBLIC_GA_MEASUREMENT_ID` в env файле

---

## 📚 Полезные ссылки

- [Mixpanel Docs](https://developer.mixpanel.com/docs/javascript)
- [GA4 Docs](https://developers.google.com/analytics/devguides/collection/ga4)
- [FSD Architecture](https://feature-sliced.design/)

---

**Последнее обновление:** 2025-01-31
