import { openDB } from 'idb'
import type { FigureState } from '../types/figures'
import type { ComposeLayout } from '../types/figures'

const DB_NAME = 'figure-modification'
const DB_VERSION = 1

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('figures'))  db.createObjectStore('figures', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('layout'))   db.createObjectStore('layout')
    if (!db.objectStoreNames.contains('previews')) db.createObjectStore('previews')
  },
})

export async function saveFigures(figures: FigureState[]): Promise<void> {
  const db = await dbPromise
  const tx = db.transaction('figures', 'readwrite')
  await tx.store.clear()
  await Promise.all(figures.map((f) => tx.store.put(f)))
  await tx.done
}

export async function loadFigures(): Promise<FigureState[]> {
  const db = await dbPromise
  return db.getAll('figures')
}

export async function saveLayout(layout: ComposeLayout): Promise<void> {
  const db = await dbPromise
  await db.put('layout', layout, 'current')
}

export async function loadLayout(): Promise<ComposeLayout | undefined> {
  const db = await dbPromise
  return db.get('layout', 'current')
}

export async function savePreview(id: string, b64: string): Promise<void> {
  const db = await dbPromise
  await db.put('previews', b64, id)
}

export async function loadAllPreviews(ids: string[]): Promise<Record<string, string>> {
  const db = await dbPromise
  const result: Record<string, string> = {}
  await Promise.all(
    ids.map(async (id) => {
      const b64 = await db.get('previews', id)
      if (b64) result[id] = b64
    }),
  )
  return result
}

export async function deletePreview(id: string): Promise<void> {
  const db = await dbPromise
  await db.delete('previews', id)
}
