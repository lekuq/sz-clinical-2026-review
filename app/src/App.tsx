import { Outlet, Route, Routes } from 'react-router'
import { AppShell } from '@/app/AppShell'
import Home from '@/pages/Home'
import SettingsPage from '@/pages/SettingsPage'
import PlaceholderPage from '@/pages/PlaceholderPage'

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="study" element={<PlaceholderPage title="刷题" />} />
        <Route path="exam" element={<PlaceholderPage title="模拟考试" />} />
        <Route path="wrong" element={<PlaceholderPage title="错题集" />} />
        <Route path="search" element={<PlaceholderPage title="智能搜题" />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
