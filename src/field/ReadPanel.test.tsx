import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { pool } from '../pool';
import { ReadPanel } from './ReadPanel';

const allowed = pool.nodes['allowed-ignorance']!;
const ilya = pool.nodes.ilya!;

describe('ReadPanel', () => {
  it('shows excerpt and read full affordance by default', () => {
    render(
      <ReadPanel
        node={allowed}
        pool={pool}
        historyTitle={null}
        reading={false}
        full={false}
        onBack={vi.fn()}
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
        reading={false}
        full={false}
        onBack={vi.fn()}
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
      await screen.findByText(/valuing intelligence above every other human quality/i),
    ).toBeInTheDocument();
  });

  it('loads essay body in full mode', async () => {
    render(
      <ReadPanel
        node={allowed}
        pool={pool}
        historyTitle={null}
        reading={false}
        full
        onBack={vi.fn()}
        onOpen={vi.fn()}
        onOpenNode={vi.fn()}
        onToggleFull={vi.fn()}
        onDescend={vi.fn()}
        canDescend
      />,
    );

    expect(screen.queryByText(allowed.excerpt[0]!)).not.toBeInTheDocument();
    const reader = screen.getByTestId('figure-reader');
    expect(reader).toBeInTheDocument();
    const prose = await screen.findByText(/usable map is not the whole object/i);
    const source = screen.getByTestId('read-source-line');
    expect(prose.compareDocumentPosition(source) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('button', { name: /collapse/i })).toBeInTheDocument();
  });
});