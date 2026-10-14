<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Toolbar from './Toolbar.svelte';
  import ToolPopup from './ToolPopup.svelte';
  import PageThumbnails from './PageThumbnails.svelte';
  import ExportModal from '../Modals/ExportModal.svelte';
  import Icons from '../Icons.svelte';
  import { CanvasEngine } from '../../canvas/engine';
  import { ApiService } from '../../services/api';
  import {
    currentNotebook,
    currentPage,
    activeView,
    isThumbnailsSidebarOpen,
    isExportModalOpen,
  } from '../../stores/appState';
  import { toolSettings } from '../../stores/toolsState';
  import {
    currentPages,
    loadPagesForNotebook,
    addNewPage,
  } from '../../stores/notebooksState';
  import type { Page, Stroke, ToolType } from '../../types';

  let canvasContainer: HTMLDivElement;
  let engine: CanvasEngine | null = null;
  let activePopupTool: ToolType | null = null;
  let saveDebounceTimer: any = null;

  onMount(async () => {
    if (!$currentNotebook) {
      activeView.set('library');
      return;
    }

    const pages = await loadPagesForNotebook($currentNotebook.id);
    if (pages.length > 0 && !$currentPage) {
      currentPage.set(pages[0]);
    }

    if ($currentPage && canvasContainer) {
      initEngine($currentPage);
    }
  });

  onDestroy(() => {
    if (engine) {
      engine.destroy();
      engine = null;
    }
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
    }
  });

  async function initEngine(page: Page) {
    if (!canvasContainer) return;

    if (engine) {
      engine.destroy();
      engine = null;
    }

    const initialStrokes = await ApiService.getStrokes(page.id);

    engine = new CanvasEngine(
      canvasContainer,
      page,
      $toolSettings,
      handleStrokesChanged
    );
    engine.setPage(page, initialStrokes);
  }

  // React to toolSettings store changes
  $: if (engine && $toolSettings) {
    engine.updateToolSettings($toolSettings);
  }

  // When currentPage changes
  $: if (engine && $currentPage) {
    ApiService.getStrokes($currentPage.id).then((strokes) => {
      if (engine && $currentPage) {
        engine.setPage($currentPage, strokes);
      }
    });
  }

  function handleStrokesChanged(strokes: Stroke[]) {
    if (!$currentPage) return;
    if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      if ($currentPage) {
        ApiService.saveStrokes($currentPage.id, strokes);
      }
    }, 600);
  }

  function handleBackToLibrary() {
    activeView.set('library');
  }

  function toggleThumbnails() {
    isThumbnailsSidebarOpen.update((v) => !v);
  }

  async function handleAddPage() {
    if (!$currentNotebook) return;
    const newPage = await addNewPage($currentNotebook.id, 'squaredGrid');
    currentPage.set(newPage);
  }

  function handleOpenExport() {
    isExportModalOpen.set(true);
  }

  function handleUndo() {
    engine?.undo();
  }

  function handleRedo() {
    engine?.redo();
  }

  function handleExportPng() {
    if (!engine || !$currentNotebook) return;
    const dataUrl = engine.exportImage('png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${$currentNotebook.title}_Page_${$currentPage?.pageNumber || 1}.png`;
    a.click();
  }

  // Keyboard shortcuts
  function handleKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
      e.preventDefault();
      handleRedo();
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="editor-layout">
  <!-- Top Bar matching Screenshot 2 (deep blue / navy header bar) -->
  <header class="editor-header">
    <div class="header-left">
      <!-- Back to Library -->
      <button class="nav-btn" on:click={handleBackToLibrary} title="Back to Documents">
        <Icons name="arrowLeft" size={18} color="#cbd5e1" />
      </button>

      <!-- Thumbnails toggle -->
      <button
        class="nav-btn"
        class:active={$isThumbnailsSidebarOpen}
        on:click={toggleThumbnails}
        title="Page Thumbnails"
      >
        <Icons name="sidebar" size={18} color="#cbd5e1" />
      </button>

      <!-- Search in document -->
      <button class="nav-btn" title="Search in Document">
        <Icons name="search" size={17} color="#cbd5e1" />
      </button>
    </div>

    <!-- Center active document Tab pill matching Screenshot 2 -->
    <div class="header-center">
      <div class="document-tab">
        <Icons name="documents" size={14} color="#38bdf8" />
        <span class="tab-title">{$currentNotebook?.title || 'Notebook'}</span>
        <button class="tab-close" on:click={handleBackToLibrary} title="Close Document">
          <Icons name="close" size={12} color="#94a3b8" />
        </button>
      </div>
    </div>

    <div class="header-right">
      <!-- Add Page (+) -->
      <button class="nav-btn" on:click={handleAddPage} title="Add Page">
        <Icons name="plus" size={18} color="#cbd5e1" />
      </button>

      <!-- Share / Export -->
      <button class="nav-btn" on:click={handleOpenExport} title="Share / Export">
        <Icons name="share" size={18} color="#cbd5e1" />
      </button>

      <!-- More options -->
      <button class="nav-btn" title="More Options">
        <Icons name="more" size={18} color="#cbd5e1" />
      </button>
    </div>
  </header>

  <!-- Main Body with Optional Left Thumbnails and Canvas Area -->
  <div class="editor-body">
    {#if $isThumbnailsSidebarOpen}
      <PageThumbnails />
    {/if}

    <main class="canvas-viewport">
      <!-- Floating Centered Toolbar matching Screenshot 2 -->
      <div class="toolbar-anchor">
        <Toolbar
          onUndo={handleUndo}
          onRedo={handleRedo}
          on:openToolSettings={(e) => (activePopupTool = e.detail)}
        />
      </div>

      <!-- Secondary tool settings popup -->
      {#if activePopupTool}
        <ToolPopup
          tool={activePopupTool}
          on:close={() => (activePopupTool = null)}
        />
      {/if}

      <!-- Page Paper Centered Area matching Screenshot 2 -->
      <div class="paper-scroll-wrapper">
        <div class="paper-sheet" bind:this={canvasContainer}>
          <!-- CanvasEngine dynamically mounts layered canvases here -->
        </div>
      </div>

      <!-- Bottom page indicator -->
      <div class="page-indicator">
        Page {$currentPage?.pageNumber || 1} of {$currentPages.length || 1}
      </div>
    </main>
  </div>

  <!-- Export Modal -->
  {#if $isExportModalOpen}
    <ExportModal onExportPng={handleExportPng} />
  {/if}
</div>

<style>
  .editor-layout {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #0c0c0e;
    overflow: hidden;
    user-select: none;
  }

  /* Deep navy top bar matching Screenshot 2 */
  .editor-header {
    height: 44px;
    background-color: #172554; /* Goodnotes deep blue top header */
    border-bottom: 1px solid #1e3a8a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    flex-shrink: 0;
    z-index: 60;
  }

  .header-left,
  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-btn {
    background: none;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .nav-btn:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .nav-btn.active {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Active document tab in top bar */
  .document-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 4px 12px;
    border-radius: 6px;
  }

  .tab-title {
    font-size: 13px;
    font-weight: 600;
    color: #f8fafc;
  }

  .tab-close {
    background: none;
    border: none;
    padding: 2px;
    display: flex;
    cursor: pointer;
    border-radius: 3px;
  }

  .tab-close:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .editor-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  .canvas-viewport {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #101014; /* Dark surround canvas background */
    overflow: hidden;
  }

  .toolbar-anchor {
    position: absolute;
    top: 14px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    pointer-events: none;
    z-index: 50;
  }

  .toolbar-anchor > :global(*) {
    pointer-events: auto;
  }

  .paper-scroll-wrapper {
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: center;
    padding: 68px 40px 60px 40px;
  }

  /* Realistic Warm Ivory Page Paper Sheet matching Screenshot 2 */
  .paper-sheet {
    width: 800px;
    height: 1100px;
    background-color: #faf8f0; /* Goodnotes signature warm ivory grid paper */
    border-radius: 4px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 1px 4px rgba(0, 0, 0, 0.4);
    position: relative;
    flex-shrink: 0;
    overflow: hidden;
  }

  .page-indicator {
    position: absolute;
    bottom: 14px;
    right: 20px;
    background: rgba(24, 24, 27, 0.85);
    border: 1px solid #27272a;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    color: #94a3b8;
    backdrop-filter: blur(4px);
  }
</style>
