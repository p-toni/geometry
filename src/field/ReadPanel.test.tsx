import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { pool } from '../pool';
import { ReadPanel } from './ReadPanel';

const allowed = pool.nodes['allowed-ignorance']!;
const bounded = pool.nodes['bounded-me']!;
const ilya = pool.nodes.ilya!;

const panelHandlers = {
  onBack: vi.fn(),
  onClose: vi.fn(),
  onOpen: vi.fn(),
  onOpenNode: vi.fn(),
  onToggleFull: vi.fn(),
  onDescend: vi.fn(),
  canDescend: true,
};

describe('ReadPanel', () => {
  it('shows excerpt and read full affordance by default', () => {
    render(
      <ReadPanel
        node={allowed}
        pool={pool}
        historyTitle={null}
        full={false}
        onBack={vi.fn()}
        onClose={vi.fn()}
        onOpen={vi.fn()}
        onOpenNode={vi.fn()}
        onToggleFull={vi.fn()}
        onDescend={vi.fn()}
        canDescend
      />,
    );

    expect(screen.getByText(allowed.excerpt[0]!)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /▤ read full/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enter its constellation/i })).toBeInTheDocument();
  });

  it('shows note body whole with no read full affordance', async () => {
    render(
      <ReadPanel
        node={ilya}
        pool={pool}
        historyTitle={null}
        full={false}
        onBack={vi.fn()}
        onClose={vi.fn()}
        onOpen={vi.fn()}
        onOpenNode={vi.fn()}
        onToggleFull={vi.fn()}
        onDescend={vi.fn()}
        canDescend
      />,
    );

    expect(screen.queryByRole('button', { name: /▤ read full/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('read-full-body')).toBeInTheDocument();
    expect(
      await screen.findByText(/gonna have a bad time/i),
    ).toBeInTheDocument();
  });

  it('loads essay body in full mode', async () => {
    render(
      <ReadPanel
        node={allowed}
        pool={pool}
        historyTitle={null}
        full
        onBack={vi.fn()}
        onClose={vi.fn()}
        onOpen={vi.fn()}
        onOpenNode={vi.fn()}
        onToggleFull={vi.fn()}
        onDescend={vi.fn()}
        canDescend
      />,
    );

    const masthead = document.querySelector('[data-figure="FIG.01"]');
    expect(masthead?.textContent).not.toContain(allowed.excerpt[0]!);
    const reader = screen.getByTestId('figure-reader');
    expect(reader).toBeInTheDocument();
    const prose = await screen.findByText(/usable map is not the whole object/i);
    const source = screen.getByTestId('read-source-line');
    expect(prose.compareDocumentPosition(source) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('button', { name: /collapse/i })).toBeInTheDocument();
  });

  it('resets scroll position when the open node changes', () => {
    const { rerender } = render(
      <ReadPanel
        node={allowed}
        pool={pool}
        historyTitle={null}
        full={false}
        {...panelHandlers}
      />,
    );

    const scroll = screen.getByTestId('read-panel-scroll');
    scroll.scrollTop = 320;

    rerender(
      <ReadPanel
        node={bounded}
        pool={pool}
        historyTitle={null}
        full={false}
        {...panelHandlers}
      />,
    );

    expect(scroll.scrollTop).toBe(0);
  });

  it('close dismisses to field; back walks history', () => {
    const onBack = vi.fn();
    const onClose = vi.fn();

    render(
      <ReadPanel
        node={allowed}
        pool={pool}
        historyTitle="bounded me"
        full
        onBack={onBack}
        onClose={onClose}
        onOpen={vi.fn()}
        onOpenNode={vi.fn()}
        onToggleFull={vi.fn()}
        onDescend={vi.fn()}
        canDescend
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onBack).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /← back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});