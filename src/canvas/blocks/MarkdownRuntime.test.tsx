import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MarkdownRuntime from './MarkdownRuntime';

describe('MarkdownRuntime', () => {
  it('renders content links as real anchors when a route exists', () => {
    const onOpenContent = vi.fn();
    render(
      <MarkdownRuntime
        markdown="[Bounded Me](/content/05-bounded-me.md)"
        onOpenContent={onOpenContent}
        resolveContentHref={() => '/writing/05-bounded-me'}
      />,
    );

    const link = screen.getByRole('link', { name: 'Bounded Me' });
    expect(link).toHaveAttribute('href', '/writing/05-bounded-me');

    fireEvent.click(link);
    expect(onOpenContent).toHaveBeenCalledWith('/content/05-bounded-me.md');
  });

  it('falls back to a button when no route exists', () => {
    const onOpenContent = vi.fn();
    render(
      <MarkdownRuntime
        markdown="[About](/content/about.md)"
        onOpenContent={onOpenContent}
        resolveContentHref={() => null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'About' }));
    expect(onOpenContent).toHaveBeenCalledWith('/content/about.md');
  });

  it('opens external links in a new tab', () => {
    render(<MarkdownRuntime markdown="[X](https://x.com/ape_toni)" />);
    const link = screen.getByRole('link', { name: 'X' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });
});
