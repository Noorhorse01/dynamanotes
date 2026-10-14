<script lang="ts">
  import Icons from '../Icons.svelte';
  import { isExportModalOpen, currentNotebook } from '../../stores/appState';
  import { ApiService } from '../../services/api';

  export let onExportPng: () => void = () => {};

  function close() {
    isExportModalOpen.set(false);
  }

  async function handleExportJson() {
    if (!$currentNotebook) return;
    try {
      const json = await ApiService.exportNotebook($currentNotebook.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${$currentNotebook.title.replace(/\s+/g, '_')}.dynamanotes`;
      a.click();
      URL.revokeObjectURL(url);
      close();
    } catch (e) {
      alert('Export failed: ' + e);
    }
  }

  function handleExportPng() {
    onExportPng();
    close();
  }

  function handlePrintPdf() {
    window.print();
    close();
  }
</script>

<div class="modal-backdrop" on:click={close}>
  <div class="modal-card" on:click|stopPropagation>
    <div class="modal-header">
      <div class="modal-title">Export Document</div>
      <button class="close-btn" on:click={close}>
        <Icons name="close" size={18} color="#94a3b8" />
      </button>
    </div>

    <div class="modal-body">
      <div class="export-options">
        <button class="export-card" on:click={handleExportPng}>
          <div class="opt-icon">
            <Icons name="documents" size={24} color="#38bdf8" />
          </div>
          <div class="opt-text">
            <div class="opt-title">Export as Image (PNG)</div>
            <div class="opt-desc">High resolution crisp render of the current page</div>
          </div>
        </button>

        <button class="export-card" on:click={handlePrintPdf}>
          <div class="opt-icon">
            <Icons name="share" size={24} color="#f43f5e" />
          </div>
          <div class="opt-text">
            <div class="opt-title">Print / Save as PDF</div>
            <div class="opt-desc">Standard vector PDF document compatible with all readers</div>
          </div>
        </button>

        <button class="export-card" on:click={handleExportJson}>
          <div class="opt-icon">
            <Icons name="documents" size={24} color="#10b981" />
          </div>
          <div class="opt-text">
            <div class="opt-title">DynamaNotes Backup (.dynamanotes)</div>
            <div class="opt-desc">Full lossless vector backup with stroke coordinates & history</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-card {
    width: 440px;
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #27272a;
  }

  .modal-title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
  }

  .modal-body {
    padding: 20px;
  }

  .export-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .export-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    background: #121214;
    border: 1px solid #27272a;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .export-card:hover {
    background: #202026;
    border-color: #38bdf8;
  }

  .opt-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .opt-title {
    font-size: 14px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .opt-desc {
    font-size: 12px;
    color: #71717a;
    margin-top: 2px;
  }
</style>
