import type { Folder, Notebook, Page, Stroke } from '../types';

let isTauriEnv = false;
let invoke: any = null;

try {
  // Check if Tauri is present
  if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
    isTauriEnv = true;
    import('@tauri-apps/api/core').then((mod) => {
      invoke = mod.invoke;
    });
  }
} catch {
  isTauriEnv = false;
}

// Local storage fallback for web preview
const STORAGE_PREFIX = 'dynamanotes_';

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// Initialize mock notebooks for first-time web preview matching Goodnotes Screenshot 1
function seedInitialData() {
  const existing = getLocal<Notebook[]>('notebooks', []);
  if (existing.length === 0) {
    const now = Date.now();
    const demoNotebooks: Notebook[] = [
      {
        id: 'nb_math',
        title: 'Math',
        coverColor: '#e0f2fe',
        coverStyle: 'folded',
        pageCount: 3,
        isFavorite: true,
        createdAt: now - 3600000,
        updatedAt: now - 1800000,
      },
      {
        id: 'nb_physics',
        title: 'Physics P5',
        coverColor: '#0f172a',
        coverStyle: 'art',
        pageCount: 12,
        isFavorite: true,
        createdAt: now - 86400000,
        updatedAt: now - 7200000,
      },
      {
        id: 'nb_cs',
        title: 'CS61A',
        coverColor: '#1e293b',
        coverStyle: 'ribbon',
        pageCount: 8,
        isFavorite: false,
        createdAt: now - 172800000,
        updatedAt: now - 14400000,
      },
      {
        id: 'nb_stats',
        title: 'Statistics',
        coverColor: '#f1f5f9',
        coverStyle: 'standard',
        pageCount: 5,
        isFavorite: false,
        createdAt: now - 259200000,
        updatedAt: now - 28800000,
      },
      {
        id: 'nb_french',
        title: 'Français',
        coverColor: '#dbeafe',
        coverStyle: 'pattern',
        pageCount: 4,
        isFavorite: false,
        createdAt: now - 345600000,
        updatedAt: now - 43200000,
      },
      {
        id: 'nb_geography',
        title: 'Geography',
        coverColor: '#f8fafc',
        coverStyle: 'standard',
        pageCount: 6,
        isFavorite: false,
        createdAt: now - 432000000,
        updatedAt: now - 57600000,
      },
      {
        id: 'nb_archive',
        title: 'Archive',
        coverColor: '#38bdf8',
        coverStyle: 'folder',
        pageCount: 0,
        isFavorite: false,
        createdAt: now - 518400000,
        updatedAt: now - 72000000,
      },
    ];

    setLocal('notebooks', demoNotebooks);

    // Initial pages
    const demoPages: Page[] = [
      {
        id: 'page_math_1',
        notebookId: 'nb_math',
        pageNumber: 1,
        template: 'squaredGrid',
        width: 800,
        height: 1100,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'page_math_2',
        notebookId: 'nb_math',
        pageNumber: 2,
        template: 'squaredGrid',
        width: 800,
        height: 1100,
        createdAt: now,
        updatedAt: now,
      },
    ];
    setLocal('pages_nb_math', demoPages);
  }
}

seedInitialData();

export const ApiService = {
  // Folders
  async getFolders(): Promise<Folder[]> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('get_folders');
      } catch (e) {
        console.warn('Tauri call failed, fallback to local', e);
      }
    }
    return getLocal<Folder[]>('folders', []);
  },

  async createFolder(name: string, parentId?: string, color?: string): Promise<Folder> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('create_folder', { name, parentId, color });
      } catch (e) {
        console.warn('Tauri call failed, fallback to local', e);
      }
    }
    const folders = getLocal<Folder[]>('folders', []);
    const newFolder: Folder = {
      id: `folder_${Date.now()}`,
      name,
      parentId,
      color: color || '#38bdf8',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    folders.push(newFolder);
    setLocal('folders', folders);
    return newFolder;
  },

  async deleteFolder(id: string): Promise<void> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('delete_folder', { id });
      } catch (e) {}
    }
    const folders = getLocal<Folder[]>('folders', []).filter((f) => f.id !== id);
    setLocal('folders', folders);
  },

  // Notebooks
  async getNotebooks(): Promise<Notebook[]> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('get_notebooks');
      } catch (e) {
        console.warn('Tauri call failed, fallback to local', e);
      }
    }
    return getLocal<Notebook[]>('notebooks', []);
  },

  async getNotebook(id: string): Promise<Notebook | null> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('get_notebook', { id });
      } catch (e) {}
    }
    const notebooks = getLocal<Notebook[]>('notebooks', []);
    return notebooks.find((n) => n.id === id) || null;
  },

  async createNotebook(params: {
    title: string;
    folderId?: string | null;
    coverColor?: string;
    coverStyle?: string;
    template?: string;
  }): Promise<Notebook> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('create_notebook', params);
      } catch (e) {
        console.warn('Tauri call failed, fallback to local', e);
      }
    }

    const notebooks = getLocal<Notebook[]>('notebooks', []);
    const newNbId = `nb_${Date.now()}`;
    const newNotebook: Notebook = {
      id: newNbId,
      title: params.title,
      folderId: params.folderId || null,
      coverColor: params.coverColor || '#1e3a5f',
      coverStyle: params.coverStyle || 'standard',
      pageCount: 1,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    notebooks.unshift(newNotebook);
    setLocal('notebooks', notebooks);

    // Create initial page
    const initialPage: Page = {
      id: `page_${newNbId}_1`,
      notebookId: newNbId,
      pageNumber: 1,
      template: (params.template as any) || 'squaredGrid',
      width: 800,
      height: 1100,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setLocal(`pages_${newNbId}`, [initialPage]);

    return newNotebook;
  },

  async updateNotebook(notebook: Notebook): Promise<Notebook> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('update_notebook', { notebook });
      } catch (e) {}
    }
    const notebooks = getLocal<Notebook[]>('notebooks', []);
    const idx = notebooks.findIndex((n) => n.id === notebook.id);
    if (idx !== -1) {
      notebooks[idx] = { ...notebook, updatedAt: Date.now() };
      setLocal('notebooks', notebooks);
    }
    return notebook;
  },

  async toggleFavorite(id: string): Promise<boolean> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('toggle_favorite', { id });
      } catch (e) {}
    }
    const notebooks = getLocal<Notebook[]>('notebooks', []);
    const nb = notebooks.find((n) => n.id === id);
    if (nb) {
      nb.isFavorite = !nb.isFavorite;
      setLocal('notebooks', notebooks);
      return nb.isFavorite;
    }
    return false;
  },

  async deleteNotebook(id: string): Promise<void> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('delete_notebook', { id });
      } catch (e) {}
    }
    const notebooks = getLocal<Notebook[]>('notebooks', []).filter((n) => n.id !== id);
    setLocal('notebooks', notebooks);
  },

  // Pages
  async getPages(notebookId: string): Promise<Page[]> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('get_pages', { notebookId });
      } catch (e) {}
    }
    return getLocal<Page[]>(`pages_${notebookId}`, []);
  },

  async addPage(notebookId: string, template?: string): Promise<Page> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('add_page', { notebookId, template });
      } catch (e) {}
    }
    const pages = getLocal<Page[]>(`pages_${notebookId}`, []);
    const newPage: Page = {
      id: `page_${notebookId}_${pages.length + 1}`,
      notebookId,
      pageNumber: pages.length + 1,
      template: (template as any) || 'squaredGrid',
      width: 800,
      height: 1100,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    pages.push(newPage);
    setLocal(`pages_${notebookId}`, pages);

    // update notebook page count
    const notebooks = getLocal<Notebook[]>('notebooks', []);
    const nb = notebooks.find((n) => n.id === notebookId);
    if (nb) {
      nb.pageCount = pages.length;
      nb.updatedAt = Date.now();
      setLocal('notebooks', notebooks);
    }

    return newPage;
  },

  async deletePage(pageId: string, notebookId: string): Promise<void> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('delete_page', { pageId, notebookId });
      } catch (e) {}
    }
    let pages = getLocal<Page[]>(`pages_${notebookId}`, []).filter((p) => p.id !== pageId);
    pages = pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setLocal(`pages_${notebookId}`, pages);
  },

  // Strokes
  async getStrokes(pageId: string): Promise<Stroke[]> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('get_strokes', { pageId });
      } catch (e) {}
    }
    return getLocal<Stroke[]>(`strokes_${pageId}`, []);
  },

  async saveStrokes(pageId: string, strokes: Stroke[]): Promise<void> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('save_strokes', { pageId, strokes });
      } catch (e) {}
    }
    setLocal(`strokes_${pageId}`, strokes);
  },

  // Export / Import
  async exportNotebook(notebookId: string): Promise<string> {
    if (isTauriEnv && invoke) {
      try {
        return await invoke('export_notebook_json', { notebookId });
      } catch (e) {}
    }
    const notebook = (await this.getNotebook(notebookId))!;
    const pages = await this.getPages(notebookId);
    const pagesWithStrokes = [];
    for (const page of pages) {
      const strokes = await this.getStrokes(page.id);
      pagesWithStrokes.push({ page, strokes });
    }
    return JSON.stringify(
      {
        notebook,
        pages: pagesWithStrokes,
        exportedAt: Date.now(),
        appVersion: '1.0.0',
      },
      null,
      2
    );
  },
};
