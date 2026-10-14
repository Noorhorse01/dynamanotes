<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { toolSettings, setEraserMode } from '../../stores/toolsState';
  import type { ToolType } from '../../types';

  export let tool: ToolType;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  function close() {
    dispatch('close');
  }
</script>

<div class="popup-backdrop" on:click={close}>
  <div class="popup-panel" on:click|stopPropagation>
    {#if tool === 'pen' || tool === 'fountainPen'}
      <div class="panel-section">
        <div class="section-title">Stroke Thickness</div>
        <div class="slider-row">
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            bind:value={$toolSettings.penSize}
            class="slider"
          />
          <span class="value-label">{$toolSettings.penSize}px</span>
        </div>
      </div>
    {:else if tool === 'highlighter'}
      <div class="panel-section">
        <div class="section-title">Highlighter Width</div>
        <div class="slider-row">
          <input
            type="range"
            min="8"
            max="40"
            step="1"
            bind:value={$toolSettings.highlighterSize}
            class="slider"
          />
          <span class="value-label">{$toolSettings.highlighterSize}px</span>
        </div>
      </div>
    {:else if tool === 'eraser'}
      <div class="panel-section">
        <div class="section-title">Eraser Mode</div>
        <div class="mode-options">
          <button
            class="mode-btn"
            class:active={$toolSettings.eraserMode === 'stroke'}
            on:click={() => setEraserMode('stroke')}
          >
            Stroke Eraser
          </button>
          <button
            class="mode-btn"
            class:active={$toolSettings.eraserMode === 'standard'}
            on:click={() => setEraserMode('standard')}
          >
            Standard Eraser
          </button>
          <button
            class="mode-btn"
            class:active={$toolSettings.eraserMode === 'highlighterOnly'}
            on:click={() => setEraserMode('highlighterOnly')}
          >
            Erase Highlighter Only
          </button>
        </div>

        <div class="section-title" style="margin-top: 14px;">Eraser Size</div>
        <div class="slider-row">
          <input
            type="range"
            min="6"
            max="40"
            bind:value={$toolSettings.eraserSize}
            class="slider"
          />
          <span class="value-label">{$toolSettings.eraserSize}px</span>
        </div>
      </div>
    {:else if tool === 'shape'}
      <div class="panel-section">
        <div class="section-title">Shape Recognition</div>
        <label class="toggle-row">
          <span>Auto-snap drawn shapes</span>
          <input type="checkbox" bind:checked={$toolSettings.shapeSnap} />
        </label>
        <label class="toggle-row" style="margin-top: 8px;">
          <span>Fill shape with color</span>
          <input type="checkbox" bind:checked={$toolSettings.shapeFill} />
        </label>
      </div>
    {/if}
  </div>
</div>

<style>
  .popup-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
  }

  .popup-panel {
    position: absolute;
    top: 92px;
    left: 50%;
    transform: translateX(-50%);
    width: 260px;
    background: #1e1e24;
    border: 1px solid #333342;
    border-radius: 12px;
    padding: 14px 16px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
    user-select: none;
  }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .slider {
    flex: 1;
    accent-color: #38bdf8;
    cursor: pointer;
  }

  .value-label {
    font-size: 12px;
    font-weight: 600;
    color: #e2e8f0;
    min-width: 38px;
    text-align: right;
  }

  .mode-options {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .mode-btn {
    background: #141418;
    border: 1px solid #2d2d38;
    border-radius: 6px;
    color: #cbd5e1;
    font-size: 12px;
    padding: 8px 10px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .mode-btn:hover {
    background: #272732;
  }

  .mode-btn.active {
    background: rgba(56, 189, 248, 0.15);
    border-color: #38bdf8;
    color: #38bdf8;
    font-weight: 600;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #e2e8f0;
    cursor: pointer;
  }
</style>
