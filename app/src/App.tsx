import { Outlet, Route, Routes } from 'react-router'
import { AppShell } from '@/app/AppShell'
import Home from '@/pages/Home'
import SettingsPage from '@/pages/SettingsPage'
import StudyPage from '@/pages/StudyPage'
import ExamPage from '@/pages/ExamPage'
import WrongBookPage from '@/pages/WrongBookPage'
import SearchPage from '@/pages/SearchPage'

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
        <Route path="study" element={<StudyPage />} />
        <Route path="exam" element={<ExamPage />} />
        <Route path="wrong" element={<WrongBookPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}




