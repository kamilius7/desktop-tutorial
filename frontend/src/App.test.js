import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Bonjour, User!/i);
  expect(headingElement).toBeInTheDocument();
});
