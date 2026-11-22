import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'

const vite = await createServer({
  configFile: 'vite.config.js',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const { default: App } = await vite.ssrLoadModule('/src/App.jsx')
  const { audiences, scripts, scriptSituations } = await vite.ssrLoadModule('/src/libraryData.js')

  if (audiences.length < 20) throw new Error('Too few audience categories: ' + audiences.length)
  if (scriptSituations.length !== 7) throw new Error('Expected seven situations')
  if (new Set(audiences.map(a=>a.id)).size !== audiences.length) throw new Error('Duplicate audience id')
  if (new Set(scripts.map(s=>s.id)).size !== scripts.length) throw new Error('Duplicate script id')

  for (const audience of audiences) {
    const items = scripts.filter(s => s.audience === audience.id)
    if (items.length !== 7) throw new Error('Expected 7 scripts for '+audience.title+', got '+items.length)
    for (const situation of scriptSituations) {
      const item = items.find(s=>s.scenario===situation.id)
      if (!item || !item.full?.trim() || !item.short?.trim()) {
        throw new Error('Missing scripts for '+audience.title+' / '+situation.title)
      }
    }
  }

  const cases = {
    dashboard: ['Лёгкие диалоги', 'Подобрать сообщение'],
    picker: ['Кому пишем?', 'Какая ситуация?', 'Скопировать скрипт'],
    audiences: ['Категории клиентов', 'Найти категорию'],
    scripts: ['Библиотека скриптов', 'Категория человека', 'Копировать'],
    benefits: ['Выгоды и бонусы', 'Калькулятор кешбэка'],
    objections: ['Работа с возражениями'],
    faq: ['Вопросы и ответы'],
  }

  for (const [view, expected] of Object.entries(cases)) {
    const html = renderToString(React.createElement(App,{initialView:view}))
    if (html.length < 1000) throw new Error('Empty '+view+' page')
    for (const text of expected) {
      if (!html.includes(text)) throw new Error(view+' page missing text: '+text)
    }
    if (html.includes('План на 7 дней')) throw new Error('Removed plan still visible')
  }

  console.log('PASS: '+audiences.length+' categories, '+scripts.length+' scenarios, '+Object.keys(cases).length+' pages render')
} finally {
  await vite.close()
}
