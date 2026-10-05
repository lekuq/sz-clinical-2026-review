import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

test('renders the product title', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { name: '医考通' })).toBeInTheDocument()
})

