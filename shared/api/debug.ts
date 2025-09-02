/**
 * Отладочная информация для проверки переменных окружения
 */

console.log('=== API Configuration ===')
console.log('REACT_APP_API:', process.env.REACT_APP_API)
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('All REACT_APP vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP')))
console.log('==========================')