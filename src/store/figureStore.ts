import { create } from 'zustand'
import type { FigureState } from '../types/figures'

interface FigureStore {
  figures: FigureState[]
  selectedId: string | null
  addFigure:    (fig: FigureState) => void
  updateFigure: (id: string, updater: (fig: FigureState) => FigureState) => void
  removeFigure: (id: string) => void
  setSelectedId:(id: string | null) => void
}

export const useFigureStore = create<FigureStore>((set) => ({
  figures: [],
  selectedId: null,
  addFigure: (fig) =>
    set((s) => ({ figures: [...s.figures, fig] })),
  updateFigure: (id, updater) =>
    set((s) => ({ figures: s.figures.map((f) => f.id === id ? updater(f) : f) })),
  removeFigure: (id) =>
    set((s) => ({
      figures: s.figures.filter((f) => f.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),
  setSelectedId: (id) => set({ selectedId: id }),
}))
