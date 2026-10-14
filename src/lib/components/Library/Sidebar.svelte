<script lang="ts">
  import Icons from '../Icons.svelte';
  import { libraryFilter } from '../../stores/appState';
  import type { LibraryFilter } from '../../types';

  const navItems: { id: LibraryFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'Documents', icon: 'documents' },
    { id: 'favorites', label: 'Favorites', icon: 'star' },
    { id: 'shared', label: 'Shared', icon: 'shared' },
    { id: 'notebooks', label: 'Marketplace', icon: 'marketplace' },
  ];

  function selectTab(id: LibraryFilter) {
    libraryFilter.set(id);
  }
</script>

<aside class="sidebar">
  <!-- Window Traffic lights spacing / Brand logo -->
  <div class="sidebar-header">
    <div class="brand">
      <div class="brand-icon">
        <Icons name="documents" size={20} color="#38bdf8" />
      </div>
      <span class="brand-title">DynamaNotes</span>
    </div>
  </div>

  <!-- Navigation items -->
  <nav class="sidebar-nav">
    {#each navItems as item}
      <button
        class="nav-item"
        class:active={$libraryFilter === item.id}
        on:click={() => selectTab(item.id)}
      >
        <span class="nav-icon">
          <Icons
            name={item.icon}
            size={18}
            color={$libraryFilter === item.id ? '#ffffff' : '#94a3b8'}
          />
        </span>
        <span class="nav-label">{item.label}</span>
      </button>
    {/each}
  </nav>

  <!-- Bottom Notification or Account pill matching Screenshot 1 -->
  <div class="sidebar-footer">
    <div class="storage-info">
      <div class="storage-title">Local Workspace</div>
      <div class="storage-sub">Offline & Fast Native SQLite</div>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    width: 220px;
    height: 100%;
    background-color: #121214;
    border-right: 1px solid #27272a;
    display: flex;
    flex-direction: column;
    user-select: none;
    flex-shrink: 0;
  }

  .sidebar-header {
    padding: 20px 16px 16px 16px;
    display: flex;
    align-items: center;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(56, 189, 248, 0.12);
  }

  .brand-title {
    font-size: 17px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.3px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 12px;
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: 8px;
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    width: 100%;
  }

  .nav-item:hover {
    background-color: #1c1c20;
    color: #f1f5f9;
  }

  .nav-item.active {
    background-color: #1d4ed8; /* Goodnotes active blue selection */
    color: #ffffff;
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid #1e1e24;
  }

  .storage-info {
    padding: 8px 10px;
    background: #18181b;
    border-radius: 6px;
    border: 1px solid #27272a;
  }

  .storage-title {
    font-size: 11px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .storage-sub {
    font-size: 10px;
    color: #71717a;
    margin-top: 2px;
  }
</style>
