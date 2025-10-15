import { render, screen } from '@testing-library/react';
import HomePage from '../page';

describe('HomePage', () => {
  it('renders navigation links', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /thunderdome judging control center/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /admin/i })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: /judge console/i })).toHaveAttribute('href', '/judge');
    expect(screen.getByRole('link', { name: /leaderboard/i })).toHaveAttribute('href', '/leaderboard');
  });
});
