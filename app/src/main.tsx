import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    if (window.confirm('发现新版本，是否立即更新？更新不会清除学习进度。')) {
      void updateSW(true)
    }
  },
  onOfflineReady() {
    console.info('题库已缓存，可以在短暂断网时继续使用。')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
