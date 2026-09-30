interface ElementOptions {
  readonly text?: string;
  readonly cls?: string;
  readonly attr?: Readonly<Record<string, string>>;
}

interface FakeKeyboardEvent {
  readonly key: string;
  preventDefault(): void;
  stopPropagation(): void;
}

export class FakeElement {
  readonly children: FakeElement[] = [];
  readonly attributes = new Map<string, string>();
  readonly classes = new Set<string>();
  text = "";
  disabled = false;
  private readonly keydownListeners: Array<(event: FakeKeyboardEvent) => void> = [];

  constructor(readonly tag = "div") {}

  empty(): void {
    this.children.length = 0;
    this.text = "";
  }

  createEl(tag: string, options: ElementOptions = {}): FakeElement {
    const child = new FakeElement(tag);
    if (options.text) child.text = options.text;
    if (options.cls) child.addClass(options.cls);
    for (const [name, value] of Object.entries(options.attr ?? {})) child.setAttr(name, value);
    this.children.push(child);
    return child;
  }

  createDiv(options: ElementOptions = {}): FakeElement {
    return this.createEl("div", options);
  }

  addClass(name: string): void {
    this.classes.add(name);
  }

  removeClass(name: string): void {
    this.classes.delete(name);
  }

  setAttr(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  setText(value: string): void {
    this.text = value;
  }

  addEventListener(type: string, callback: (event: FakeKeyboardEvent) => void): void {
    if (type === "keydown") this.keydownListeners.push(callback);
  }

  dispatchKeydown(event: FakeKeyboardEvent): void {
    for (const callback of this.keydownListeners) callback(event);
  }

  get textContent(): string {
    return [this.text, ...this.children.map((child) => child.textContent)].filter(Boolean).join(" ");
  }
}

type MaybePromise = void | Promise<void>;

export class FakeButtonComponent {
  readonly buttonEl = new FakeElement("button");
  private callback: (() => MaybePromise) | undefined;

  setButtonText(text: string): this { this.buttonEl.text = text; return this; }
  setCta(): this { return this; }
  setDestructive(): this { return this; }
  setDisabled(disabled: boolean): this { this.buttonEl.disabled = disabled; return this; }
  onClick(callback: () => MaybePromise): this { this.callback = callback; return this; }
  async click(): Promise<void> { await this.callback?.(); }
}

export class FakeToggleComponent {
  readonly toggleEl = new FakeElement("button");
  value = false;
  private callback: ((value: boolean) => MaybePromise) | undefined;

  setValue(value: boolean): this { this.value = value; return this; }
  onChange(callback: (value: boolean) => MaybePromise): this { this.callback = callback; return this; }
  async change(value: boolean): Promise<void> { this.value = value; await this.callback?.(value); }
}

export class FakeTextComponent {
  readonly inputEl = new FakeElement("input");
  value = "";
  placeholder = "";
  private callback: ((value: string) => MaybePromise) | undefined;

  setPlaceholder(value: string): this { this.placeholder = value; return this; }
  setValue(value: string): this { this.value = value; return this; }
  onChange(callback: (value: string) => MaybePromise): this { this.callback = callback; return this; }
  async change(value: string): Promise<void> { this.value = value; await this.callback?.(value); }
}

export class FakeDropdownComponent {
  readonly selectEl = new FakeElement("select");
  readonly options = new Map<string, string>();
  value = "";
  private callback: ((value: string) => MaybePromise) | undefined;

  addOption(value: string, label: string): this { this.options.set(value, label); return this; }
  setValue(value: string): this { this.value = value; return this; }
  onChange(callback: (value: string) => MaybePromise): this { this.callback = callback; return this; }
  async change(value: string): Promise<void> { this.value = value; await this.callback?.(value); }
}

export const runtimeControls = {
  buttons: [] as FakeButtonComponent[],
  toggles: [] as FakeToggleComponent[],
  texts: [] as FakeTextComponent[],
  dropdowns: [] as FakeDropdownComponent[]
};

export function resetRuntimeControls(): void {
  openModals.length = 0;
  notices.length = 0;
  runtimeControls.buttons.length = 0;
  runtimeControls.toggles.length = 0;
  runtimeControls.texts.length = 0;
  runtimeControls.dropdowns.length = 0;
}

export interface FakeCommand {
  readonly id: string;
  readonly name: string;
  readonly callback?: () => unknown;
  readonly checkCallback?: (checking: boolean) => boolean | void;
}

export class Plugin {
  readonly commands: FakeCommand[] = [];
  readonly ribbonCallbacks: Array<() => unknown> = [];
  readonly registeredEvents: unknown[] = [];
  savedData: unknown = null;

  constructor(readonly app: unknown, readonly manifest?: unknown) {}
  addSettingTab(_tab: unknown): void {}
  addRibbonIcon(_icon: string, _title: string, callback: () => unknown): FakeElement {
    this.ribbonCallbacks.push(callback);
    return new FakeElement("div");
  }
  addCommand(command: FakeCommand): FakeCommand { this.commands.push(command); return command; }
  registerEvent(ref: unknown): void { this.registeredEvents.push(ref); }
  async loadData(): Promise<unknown> { return this.savedData; }
  async saveData(data: unknown): Promise<void> { this.savedData = data; }
}

export class PluginSettingTab {}

/** Modals that are currently open, in opening order. */
export const openModals: Modal[] = [];

export class Modal {
  readonly modalEl = new FakeElement("div");
  readonly contentEl = new FakeElement("div");

  constructor(readonly app?: unknown) {}
  open(): void {
    openModals.push(this);
    (this as { onOpen?: () => void }).onOpen?.();
  }
  close(): void {
    const index = openModals.indexOf(this);
    if (index < 0) return;
    openModals.splice(index, 1);
    (this as { onClose?: () => void }).onClose?.();
  }
}

export const notices: string[] = [];

export class Notice {
  constructor(message?: string) {
    if (message !== undefined) notices.push(message);
  }
}

export class Setting {
  readonly settingEl: FakeElement;

  constructor(container: FakeElement) {
    this.settingEl = container.createDiv({ cls: "setting-item" });
  }

  setClass(name: string): this { this.settingEl.addClass(name); return this; }
  setName(name: string): this { this.settingEl.createEl("div", { text: name, cls: "setting-item-name" }); return this; }
  setDesc(description: string): this { this.settingEl.createEl("div", { text: description, cls: "setting-item-description" }); return this; }
  addButton(builder: (button: FakeButtonComponent) => void): this {
    const button = new FakeButtonComponent();
    runtimeControls.buttons.push(button);
    builder(button);
    this.settingEl.children.push(button.buttonEl);
    return this;
  }
  addToggle(builder: (toggle: FakeToggleComponent) => void): this {
    const toggle = new FakeToggleComponent();
    runtimeControls.toggles.push(toggle);
    builder(toggle);
    this.settingEl.children.push(toggle.toggleEl);
    return this;
  }
  addText(builder: (text: FakeTextComponent) => void): this {
    const text = new FakeTextComponent();
    runtimeControls.texts.push(text);
    builder(text);
    this.settingEl.children.push(text.inputEl);
    return this;
  }
  addTextArea(builder: (text: FakeTextComponent) => void): this {
    const text = new FakeTextComponent();
    runtimeControls.texts.push(text);
    builder(text);
    this.settingEl.children.push(text.inputEl);
    return this;
  }
  addDropdown(builder: (dropdown: FakeDropdownComponent) => void): this {
    const dropdown = new FakeDropdownComponent();
    runtimeControls.dropdowns.push(dropdown);
    builder(dropdown);
    this.settingEl.children.push(dropdown.selectEl);
    return this;
  }
}

export class TFile {}
