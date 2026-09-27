// src/components/Button/__tests__/Button.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('должен рендерить кнопку с текстом', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('должен обрабатывать клик', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('должен отображаться как secondary', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText('Secondary');
    // Проверяем, что класс secondary присутствует
    expect(button.className).toContain('secondary');
  });

  it('должен быть отключён при disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });

  it('должен иметь размер sm', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByText('Small');
    expect(button.className).toContain('sm');
  });
});