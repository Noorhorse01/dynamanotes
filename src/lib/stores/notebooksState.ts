import { writable } from 'svelte/store';
import type { Folder, Notebook, Page } from '../types';
import { ApiService } from '../services/api';

export const notebooks = writable<Notebook[]>([]);
export const folders = writable<Folder[]>([]);
export const currentPages = writable<Page[]>([]);
export const isLoading = writable<boolean>(false);

export async function loadNotebooks() {
  isLoading.set(true);
  try {
    const [nbList, folderList] = await Promise.all([
      ApiService.getNotebooks(),
      ApiService.getFolders(),
    ]);
    notebooks.set(nbList);
    folders.set(folderList);
  } catch (err) {
    console.error('Error loading library data:', err);
  } finally {
    isLoading.set(false);
  }
}

export async function createNewNotebook(params: {
  title: string;
  folderId?: string | null;
  coverColor?: string;
  coverStyle?: string;
  template?: string;
}): Promise<Notebook> {
  const newNb = await ApiService.createNotebook(params);
  notebooks.update((list) => [newNb, ...list]);
  return newNb;
}

export async function deleteNotebookById(id: string) {
  await ApiService.deleteNotebook(id);
  notebooks.update((list) => list.filter((n) => n.id !== id));
}

export async function toggleNotebookFavorite(id: string) {
  const isFav = await ApiService.toggleFavorite(id);
  notebooks.update((list) =>
    list.map((n) => (n.id === id ? { ...n, isFavorite: isFav } : n))
  );
}

export async function loadPagesForNotebook(notebookId: string): Promise<Page[]> {
  const pages = await ApiService.getPages(notebookId);
  currentPages.set(pages);
  return pages;
}

export async function addNewPage(notebookId: string, template?: string): Promise<Page> {
  const newPage = await ApiService.addPage(notebookId, template);
  currentPages.update((pages) => [...pages, newPage]);
  notebooks.update((list) =>
    list.map((n) => (n.id === notebookId ? { ...n, pageCount: n.pageCount + 1 } : n))
  );
  return newPage;
}
