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
  const html = renderToString(React.createElement(App))
  for (const required of ['SW', 'Лёгкие диалоги', 'Подобрать сообщение', 'Быстрый подбор скрипта']) {
    if (!html.includes(required)) {
      throw new Error('Missing UI text: ' + required)
    }
  }
  console.log('PASS: homepage renders successfully (' + html.length + ' characters)')
} finally {
  await vite.close()
}
