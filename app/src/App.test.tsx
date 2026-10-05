import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

test('renders the product title', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  )

  expect(screen.getByText(/2026 深圳医师定期考核/)).toBeInTheDocument()
})
