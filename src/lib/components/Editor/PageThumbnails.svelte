<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icons from '../Icons.svelte';
  import { currentPages, addNewPage } from '../../stores/notebooksState';
  import { currentNotebook, currentPage, isThumbnailsSidebarOpen } from '../../stores/appState';
  import type { Page } from '../../types';

  const dispatch = createEventDispatcher<{
    selectPage: Page;
  }>();

  function handleSelect(page: Page) {
    currentPage.set(page);
    dispatch('selectPage', page);
  }

  async function handleAddPage() {
    if (!$currentNotebook) return;
    const newPage = await addNewPage($currentNotebook.id, 'squaredGrid');
    handleSelect(newPage);
  }

  function close() {
    isThumbnailsSidebarOpen.set(false);
  }
</script>

<aside class="thumbnails-sidebar">
  <div class="header">
    <div class="title">Pages ({$currentPages.length})</div>
    <div class="actions">
      <button class="icon-btn" on:click={handleAddPage} title="Add Page">
        <Icons name="plus" size={16} color="#ffffff" />
      </button>
      <button class="icon-btn" on:click={close} title="Close Sidebar">
        <Icons name="close" size={16} color="#94a3b8" />
      </button>
    </div>
  </div>

  <div class="pages-list">
    {#each $currentPages as page (page.id)}
      <div
        class="page-item"
        class:active={$currentPage?.id === page.id}
        on:click={() => handleSelect(page)}
      >
        <div class="page-thumb">
          <div class="mini-grid"></div>
        </div>
        <div class="page-label">{page.pageNumber}</div>
      </div>
    {/each}
  </div>
</aside>

<style>
  .thumbnails-sidebar {
    width: 180px;
    height: 100%;
    background: #141418;
    border-right: 1px solid #27272a;
    display: flex;
    flex-direction: column;
    user-select: none;
    flex-shrink: 0;
    z-index: 40;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid #27272a;
  }

  .title {
    font-size: 13px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    border-radius: 4px;
  }

  .icon-btn:hover {
    background: #27272a;
  }

  .pages-list {
    flex: 1;
    overflow-y: auto;
    padding: 14px 10px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  .page-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  .page-thumb {
    width: 90px;
    height: 124px;
    background: #faf8f0;
    border-radius: 4px;
    border: 1px solid #3f3f46;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    position: relative;
    overflow: hidden;
    transition: all 0.15s ease;
  }

  .page-item:hover .page-thumb {
    border-color: #38bdf8;
  }

  .page-item.active .page-thumb {
    border: 2px solid #38bdf8;
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
  }

  .mini-grid {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 1px, transparent 1px);
    background-size: 6px 6px;
  }

  .page-label {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 500;
  }

  .page-item.active .page-label {
    color: #38bdf8;
    font-weight: 700;
  }
</style>
