// declare module 'obsidian' {
//   export class Plugin {
//     app: any; // App ya es parte de la clase Plugin
//     addCommand(command: any): void;
//     addSettingTab(tab: any): void;
//     onload(): void;
//     onunload(): void;
//     loadData(): Promise<any>;
//     saveData(data: any): Promise<void>;
//   }

//   export class PluginSettingTab {
//     containerEl: HTMLElement;
//     constructor(app: any, plugin: any); // No necesitas 'App' directamente
//     display(): void;
//   }

//   export class Setting {
//     constructor(containerEl: HTMLElement);
//     setName(name: string): this;
//     setDesc(desc: string): this;
//     addText(callback: (text: TextComponent) => void): this;
//     addDropdown(callback: (dropdown: DropdownComponent) => void): this;
//   }

//   export class TextComponent {
//     setValue(value: string): this;
//     onChange(callback: (value: string) => void): this;
//   }

//   export class DropdownComponent {
//     addOption(value: string, display: string): this;
//     setValue(value: string): this;
//     onChange(callback: (value: string) => void): this;
//   }

//   export class Editor {
//     getSelection(): string;
//     replaceSelection(content: string): void;
//   }

//   export class Notice {
//     constructor(message: string);
//   }
// }
// export class TextComponent {
//   inputEl: HTMLInputElement;
//   setValue(value: string): this;
//   onChange(callback: (value: string) => void): this;
//   setPlaceholder(placeholder: string): this; // Añadir esta línea
// }
