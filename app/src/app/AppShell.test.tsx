import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AppShell } from './AppShell'

test('shows all primary navigation entries', () => {
  render(
    <MemoryRouter>
      <AppShell>
        <div>内容</div>
      </AppShell>
    </MemoryRouter>,
  )

  expect(screen.getByRole('link', { name: '首页' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '刷题' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '搜题' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '我的' })).toBeInTheDocument()
})
