import { writable } from 'svelte/store';
import type { ActiveView, LibraryFilter, Notebook, Page } from '../types';

export const activeView = writable<ActiveView>('library');
export const currentNotebook = writable<Notebook | null>(null);
export const currentPage = writable<Page | null>(null);
export const libraryFilter = writable<LibraryFilter>('all');
export const searchQuery = writable<string>('');
export const isSidebarOpen = writable<boolean>(true);
export const isThumbnailsSidebarOpen = writable<boolean>(false);

// Modals
export const isNewNotebookModalOpen = writable<boolean>(false);
export const isExportModalOpen = writable<boolean>(false);
export const isNewFolderModalOpen = writable<boolean>(false);
