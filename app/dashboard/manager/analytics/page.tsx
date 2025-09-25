"use client"

import { useRole } from "@/shared/hooks"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  Home,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  CreditCard,
  Target,
  Award,
  UserCheck,
  UserX,
  Star,
  MapPin,
  Calendar,
  Zap,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from "lucide-react"

export default function ManagerAnalyticsPage() {
  const { isManager, user } = useRole()
  const router = useRouter()

  // Проверка доступа только для менеджеров
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Требуется авторизация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Для доступа к этой странице необходимо войти в систему.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/auth/login')} className="flex-1">
                Войти
              </Button>
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                На главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isManager) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Доступ ограничен
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Эта страница доступна только менеджерам.
            </p>
            <p className="text-sm text-gray-500">
              Ваша роль: {user.role?.name || 'Не определена'}
            </p>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <h1 className="text-4xl font-bold">Product Analytics</h1>
      </div>

      {/* Product Metrics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" />
          Product Metrics
        </h2>

        {/* Conversion Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-gray-600" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Просмотры курсов</span>
                  <span className="font-semibold">2,456</span>
                </div>
                <Progress value={100} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Регистрации</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">892</span>
                    <Badge variant="secondary" className="text-xs">36.3%</Badge>
                  </div>
                </div>
                <Progress value={36.3} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Оплаты</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">267</span>
                    <Badge variant="default" className="text-xs">10.9%</Badge>
                  </div>
                </div>
                <Progress value={10.9} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Course Completion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Course Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-600 mb-1">73.2%</div>
                <p className="text-sm text-gray-600">студентов завершают курсы</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Онлайн курсы</span>
                  <span className="font-medium">78.5%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Офлайн курсы</span>
                  <span className="font-medium">68.9%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Средняя длительность</span>
                  <span className="font-medium">4.2 нед</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Retention */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-purple-600" />
                Student Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">1 месяц</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">89%</span>
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <Progress value={89} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">3 месяца</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">64%</span>
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <Progress value={64} className="h-2" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">6 месяцев</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">42%</span>
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  </div>
                </div>
                <Progress value={42} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NPS Score */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Net Promoter Score (NPS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-1">+42</div>
                <p className="text-sm text-gray-600">Общий NPS</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600 mb-1">58%</div>
                <p className="text-sm text-gray-600">Промоутеры</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-600 mb-1">26%</div>
                <p className="text-sm text-gray-600">Нейтральные</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-red-600 mb-1">16%</div>
                <p className="text-sm text-gray-600">Критики</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          Growth Metrics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* CAC/LTV Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                CAC / LTV Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center border-b pb-3">
                  <div className="text-2xl font-bold text-blue-600 mb-1">3.2x</div>
                  <p className="text-sm text-gray-600">LTV/CAC Ratio</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CAC</span>
                  <span className="font-semibold">₽ 2,340</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">LTV</span>
                  <span className="font-semibold">₽ 7,488</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payback Period</span>
                  <span className="font-semibold">2.1 мес</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cohort Analysis Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Cohort Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Январь 2024</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">156 студентов</span>
                    <Badge variant="outline" className="text-xs">67% retention</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Февраль 2024</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">203 студентов</span>
                    <Badge variant="outline" className="text-xs">71% retention</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Март 2024</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">189 студентов</span>
                    <Badge variant="outline" className="text-xs">64% retention</Badge>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-3">
                  Подробный анализ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Viral Coefficient */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Viral Coefficient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center border-b pb-3">
                  <div className="text-3xl font-bold text-orange-600 mb-1">1.43</div>
                  <p className="text-sm text-gray-600">новых студентов на реферал</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Referral Rate</span>
                  <span className="font-semibold">18.5%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="font-semibold">7.7%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Referrals</span>
                  <span className="font-semibold">347</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Growth */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-600" />
              Monthly Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-2xl font-bold text-green-600">+23%</span>
                  <ArrowUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm text-gray-600">Новые студенты</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-2xl font-bold text-blue-600">+18%</span>
                  <ArrowUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm text-gray-600">Revenue</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-2xl font-bold text-purple-600">+31%</span>
                  <ArrowUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm text-gray-600">Активные курсы</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-2xl font-bold text-orange-600">+12%</span>
                  <ArrowUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-sm text-gray-600">Преподаватели</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Behavioral Insights Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Eye className="h-6 w-6 text-indigo-600" />
          Behavioral Insights
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Popular Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Популярные категории
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Программирование</span>
                  <div className="flex items-center gap-3">
                    <Progress value={87} className="w-24 h-2" />
                    <span className="font-semibold text-sm">87%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Дизайн</span>
                  <div className="flex items-center gap-3">
                    <Progress value={73} className="w-24 h-2" />
                    <span className="font-semibold text-sm">73%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Маркетинг</span>
                  <div className="flex items-center gap-3">
                    <Progress value={61} className="w-24 h-2" />
                    <span className="font-semibold text-sm">61%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Языки</span>
                  <div className="flex items-center gap-3">
                    <Progress value={45} className="w-24 h-2" />
                    <span className="font-semibold text-sm">45%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peak Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Пиковые времена
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Дни недели</p>
                  <div className="flex justify-between text-xs">
                    <Badge variant="outline">Пн: 23%</Badge>
                    <Badge variant="default">Вт: 31%</Badge>
                    <Badge variant="outline">Ср: 28%</Badge>
                    <Badge variant="default">Чт: 29%</Badge>
                    <Badge variant="outline">Пт: 18%</Badge>
                    <Badge variant="secondary">Сб: 12%</Badge>
                    <Badge variant="secondary">Вс: 9%</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Время дня</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-semibold">41%</div>
                      <div className="text-xs text-gray-600">Вечер</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-semibold text-blue-600">35%</div>
                      <div className="text-xs text-gray-600">День</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-semibold">24%</div>
                      <div className="text-xs text-gray-600">Утро</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Geographic Distribution */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Географическое распределение
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 mb-1">34%</div>
                <p className="text-sm text-gray-600">Москва</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600 mb-1">22%</div>
                <p className="text-sm text-gray-600">СПб</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 mb-1">18%</div>
                <p className="text-sm text-gray-600">Регионы</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600 mb-1">26%</div>
                <p className="text-sm text-gray-600">Онлайн</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seasonal Trends & Forecasting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Seasonal Trends & Forecasting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Сезонные тренды</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Январь - март</span>
                  <Badge variant="default">Пик (+45%)</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Апрель - июнь</span>
                  <Badge variant="outline">Норма</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Июль - август</span>
                  <Badge variant="secondary">Спад (-30%)</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Сентябрь - декабрь</span>
                  <Badge variant="default">Рост (+25%)</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Прогноз на следующий месяц</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Новые студенты</span>
                  <span className="font-semibold text-green-600">+15% (283)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Доход</span>
                  <span className="font-semibold text-blue-600">₽ 2.1M (+12%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Новые курсы</span>
                  <span className="font-semibold text-purple-600">47 (+22%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Churn Rate</span>
                  <span className="font-semibold text-orange-600">4.2% (-0.8%)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}