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

### **Список всех событий:**

#### **🎯 Acquisition (Привлечение)**
| Событие | Когда отправлять | Properties |
|---------|------------------|------------|
| `VISITED_LANDING_PAGE` | При загрузке главной страницы | `referrer`, `utm_source`, `utm_medium`, `utm_campaign` |
| `CLICKED_SIGN_UP` | При клике на кнопку регистрации | `button_location` (header/hero/cta) |

#### **✨ Activation (Активация)**
| Событие | Когда отправлять | Properties |
|---------|------------------|------------|
| `REGISTERED` | После успешной регистрации | `method` (email/pinterest/google), `role` (student/teacher) |
| `COMPLETED_PROFILE` | После заполнения профиля | `has_avatar`, `has_bio`, `profile_completion_percentage` |
| `STARTED_LESSON` | При начале урока | `course_id`, `lesson_id`, `lesson_title`, `is_first_lesson` |
| `COMPLETED_LESSON` | При завершении урока (90%+) | `course_id`, `lesson_id`, `duration_seconds`, `completion_percentage` |

#### **💬 Engagement (Вовлечённость)**
| Событие | Когда отправлять | Properties |
|---------|------------------|------------|
| `COMMENTED_ON_LESSON` | После отправки комментария | `lesson_id`, `comment_length`, `is_reply` |
| `UPLOADED_ARTWORK` | После загрузки работы | `file_type`, `file_size_kb`, `has_description` |

#### **💰 Conversion (Конверсия)**
| Событие | Когда отправлять | Properties |
|---------|------------------|------------|
| `CREATED_BOOKING` | После создания бронирования | `course_id`, `price`, `currency`, `discount_applied` |
| `PAYMENT_SUCCESS` | После успешной оплаты | `booking_id`, `amount`, `payment_method`, `transaction_id` |

---

## 🚀 Использование

### **1. В React компонентах (рекомендуется)**

```typescript
import { useAnalytics } from '@/shared/hooks/useAnalytics'
import { AnalyticsEvent } from '@/shared/lib/analytics'

export function RegisterForm() {
  const { track, identify } = useAnalytics()

  const handleRegister = async (data) => {
    const user = await authAPI.register(data)

    // Идентифицируем пользователя
    identify(user.documentId, {
      email: user.email,
      username: user.username,
      role: user.role.type,
      signup_date: user.createdAt
    })

    // Трекаем событие (автоматически добавит user_id и user_role)
    track(AnalyticsEvent.REGISTERED, {
      method: 'email',
      role: user.role.type
    })
  }

  return <form onSubmit={handleRegister}>...</form>
}
```

### **2. Напрямую (без хука)**

```typescript
import { analytics, AnalyticsEvent } from '@/shared/lib/analytics'

// В any context (не только React)
analytics.track(AnalyticsEvent.VISITED_LANDING_PAGE, {
  referrer: document.referrer,
  utm_source: 'google',
  utm_campaign: 'summer_2025'
})
```

### **3. Revenue tracking**

```typescript
const { revenue } = useAnalytics()

// После успешной оплаты
revenue(5000, {
  booking_id: booking.documentId,
  course_id: course.documentId,
  currency: 'RUB',
  payment_method: 'tinkoff'
})
```

### **4. User properties**

```typescript
const { setProperties } = useAnalytics()

// Обновление свойств пользователя
setProperties({
  total_courses_purchased: 3,
  subscription_tier: 'premium',
  last_login: new Date().toISOString()
})
```

### **5. Increment counters**

```typescript
const { increment } = useAnalytics()

// После завершения урока
increment('total_lessons_completed', 1)

// После комментария
increment('total_comments', 1)
```

### **6. Logout**

```typescript
const { logout } = useAnalytics()

// При выходе пользователя
const handleLogout = () => {
  logout() // Сбросит все данные в аналитике
  authAPI.logout()
}
```

---

## ➕ Как добавить новое событие

### **Шаг 1: Добавить в enum**

Файл: `shared/lib/analytics/events.ts`

```typescript
export enum AnalyticsEvent {
  // ... существующие события

  // Новое событие
  SHARED_COURSE = 'Shared Course',
}
```

### **Шаг 2: Определить properties**

```typescript
export interface EventProperties {
  // ... существующие properties

  [AnalyticsEvent.SHARED_COURSE]: {
    course_id: string
    course_title: string
    share_method: 'facebook' | 'twitter' | 'linkedin' | 'copy_link'
    share_location: 'course_page' | 'profile' | 'catalog'
  } & EventPropertiesBase
}
```

### **Шаг 3: Использовать**

```typescript
track(AnalyticsEvent.SHARED_COURSE, {
  course_id: '123',
  course_title: 'Animation Basics',
  share_method: 'twitter',
  share_location: 'course_page'
})
```

TypeScript автоматически подскажет доступные properties! ✅

---

## 🔌 Добавление новых провайдеров

> 📝 **Примечание:** Инструкция по добавлению новых аналитических провайдеров будет добавлена позже.

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

// Отправить тестовое событие
analytics.track(AnalyticsEvent.VISITED_LANDING_PAGE, {
  referrer: document.referrer
})
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
track('user_registered', { method: 'email' })
```

✅ **Хорошо:**
```typescript
track(AnalyticsEvent.REGISTERED, { method: 'email' })
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

### **3. Track revenue для всех платежей**

```typescript
// После Payment Success
revenue(booking.amount, {
  booking_id: booking.documentId,
  course_id: course.documentId,
  transaction_id: payment.transaction_id
})
```

### **4. Не спамить событиями**

❌ **Плохо:**
```typescript
// Каждый клик, каждый hover
onClick={() => track(AnalyticsEvent.BUTTON_CLICKED)}
```

✅ **Хорошо:**
```typescript
// Только значимые действия
onSubmit={() => track(AnalyticsEvent.REGISTERED)}
```

### **5. Обогащать события контекстом**

✅ **Хорошо:**
```typescript
track(AnalyticsEvent.STARTED_LESSON, {
  course_id: course.documentId,
  course_title: course.title,
  lesson_id: lesson.id,
  lesson_title: lesson.title,
  is_first_lesson: lessonNumber === 1,
  lesson_number: lessonNumber
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

**Последнее обновление:** 2025-01-24
