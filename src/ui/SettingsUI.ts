import './settings.css';

export interface SliderConfig {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

export class SettingsUI {
  container!: HTMLElement;
  button!: HTMLElement;
  dropdown!: HTMLElement;
  isWebGL: boolean;
  private isOpen: boolean = false;

  constructor(isWebGL: boolean, sliders: SliderConfig[]) {
    this.isWebGL = isWebGL;
    this.createDOM(sliders);
    this.addListeners();
  }

  createDOM(sliders: SliderConfig[]) {
    const gearIcon = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
    const folderIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
    const switchIcon = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="14" x2="21" y2="3"></line><polyline points="8 21 3 21 3 16"></polyline><line x1="20" y1="10" x2="3" y2="21"></line></svg>`;

    const slidersHTML = sliders.map(s => `
      <div class="slider-group">
        <div class="slider-header">
          <label for="${s.id}">${s.name}</label>
          <span id="${s.id}-val">${s.value}</span>
        </div>
        <input type="range" id="${s.id}" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.value}">
      </div>
    `).join('');

    const html = `
      <div class="settings-dropdown-container">
        <div class="settings-btn" id="settings-btn" title="Settings">${gearIcon}</div>
        <div class="settings-dropdown" id="settings-dropdown">
          <div class="settings-dropdown-header">
            <h3 class="settings-title">Gallery Settings</h3>
          </div>
          <div class="settings-actions">
            <button class="settings-action-btn" id="settings-load-folder">${folderIcon} Load Local Folder</button>
            <button class="settings-action-btn" id="settings-switch-version">${switchIcon} Switch to ${this.isWebGL ? '2D DOM' : 'WebGL'} Version</button>
          </div>
          <div class="settings-sliders">
            ${slidersHTML}
          </div>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);

    this.container = wrapper;
    this.button = document.getElementById('settings-btn')!;
    this.dropdown = document.getElementById('settings-dropdown')!;

    sliders.forEach(s => {
      const input = document.getElementById(s.id) as HTMLInputElement;
      const valDisplay = document.getElementById(`${s.id}-val`)!;
      input.addEventListener('input', (e) => {
        const val = parseFloat((e.target as HTMLInputElement).value);
        valDisplay.textContent = val.toString();
        s.onChange(val);
      });
    });
  }

  addListeners() {
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target as Node)) {
        this.closeDropdown();
      }
    });

    document.getElementById('settings-load-folder')?.addEventListener('click', () => {
      document.getElementById('folder-input')?.click();
      this.closeDropdown();
    });

    document.getElementById('settings-switch-version')?.addEventListener('click', () => {
      window.location.href = this.isWebGL ? 'index.html' : 'index2.html';
    });
  }

  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this.dropdown.classList.add('visible');
    this.isOpen = true;
  }

  closeDropdown() {
    this.dropdown.classList.remove('visible');
    this.isOpen = false;
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}