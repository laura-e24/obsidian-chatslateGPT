import { Editor, Plugin, PluginSettingTab, Setting, Notice, Menu, MarkdownView } from 'obsidian';

// Interfaz para la configuración del plugin
interface TranslatorSettings {
  sourceLanguage: string;
  targetLanguage: string;
}

const DEFAULT_SETTINGS: TranslatorSettings = {
  sourceLanguage: 'de', // Idioma de origen por defecto: alemán
  targetLanguage: 'es', // Idioma de destino por defecto: español
};

export default class TranslatorPlugin extends Plugin {
  settings: TranslatorSettings = DEFAULT_SETTINGS; // Inicializar con DEFAULT_SETTINGS

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new TranslatorSettingTab(this.app, this));
    this.addCommand({
      id: 'translate-selected-text',
      name: 'Traducir texto seleccionado',
      callback: () => {
        const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
        if (editor) {
          this.translateSelectedText(editor, this.settings.targetLanguage);
        } else {
          new Notice('No hay un editor activo.');
        }
      },
    });
    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu, editor) => {
        menu.addItem(item => {
          item
            .setTitle('Traducir al español')
            .setIcon('translate')
            .onClick(() => this.translateSelectedText(editor, 'es'));
        });

        // Submenú para seleccionar idioma
        menu.addItem(item => {
          item
            .setTitle('Traducir a...')
            .setIcon('language')
            .onClick(async evt => {
              const subMenu = new Menu();

              subMenu.addItem(subItem => {
                subItem.setTitle('Inglés').onClick(async () => {
                  await this.translateSelectedText(editor, 'en');
                });
              });

              subMenu.addItem(subItem => {
                subItem.setTitle('Italiano').onClick(async () => {
                  await this.translateSelectedText(editor, 'it');
                });
              });

              subMenu.addItem(subItem => {
                subItem.setTitle('Portugués').onClick(async () => {
                  await this.translateSelectedText(editor, 'pt');
                });
              });

              subMenu.addItem(subItem => {
                subItem.setTitle('Ruso').onClick(async () => {
                  await this.translateSelectedText(editor, 'ru');
                });
              });

              if (evt instanceof MouseEvent) {
                subMenu.showAtMouseEvent(evt);
              }
            });
        });
      })
    );
  }

  async showTranslationText(editor: Editor, originalText: string, translation: string) {
    if (translation) {
      const translationText = `\n<!-- Traducción: ${translation} -->`;
      editor.replaceSelection(originalText + translationText);
    } else {
      new Notice('No se pudo obtener la traducción.');
    }
  }

  async translateSelectedText(editor: Editor, targetLang: string): Promise<string | null> {
    const selectedText = editor.getSelection();

    if (!selectedText) {
      new Notice('Por favor, selecciona un texto primero.');
      return null; // Retorna null si no hay texto seleccionado
    }

    // Mostrar el aviso de que está cargando
    const loadingNotice = new Notice('Cargando traducción...', 0); // 0 significa que el aviso se mantendrá visible

    try {
      const translation = await this.fetchTranslation(selectedText, targetLang);

      if (translation) {
        this.showTranslationText(editor, selectedText, translation);
        return translation;
      } else {
        new Notice('No se pudo obtener la traducción.');
        return null;
      }
    } finally {
      // Eliminar el aviso de carga cuando finalice la traducción
      loadingNotice.hide();
    }
  }

  // Función para hacer la solicitud a la API de LibreTranslate
  async fetchTranslation(text: string, targetLang: any): Promise<string | null> {
    const response = await fetch('http://localhost:5000/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLang,
        format: 'text',
      }),
    });

    const data = await response.json();
    return data.translatedText || null;
  }

  // Cargar configuración del plugin
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  // Guardar configuración del plugin
  async saveSettings() {
    await this.saveData(this.settings);
  }
}

// Pestaña de configuración del plugin
class TranslatorSettingTab extends PluginSettingTab {
  plugin: TranslatorPlugin;

  constructor(app: any, plugin: TranslatorPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Configuración del Traductor' });

    // Configuración del idioma de origen
    new Setting(containerEl)
      .setName('Idioma de origen')
      .setDesc('Selecciona el idioma del texto que deseas traducir.')
      .addDropdown(dropdown =>
        dropdown
          .addOption('en', 'Inglés')
          .addOption('es', 'Español')
          .addOption('de', 'Alemán')
          .addOption('it', 'Italiano')
          .addOption('pt', 'Portugués')
          .addOption('ru', 'Ruso')
          .setValue(this.plugin.settings.sourceLanguage)
          .onChange(async value => {
            this.plugin.settings.sourceLanguage = value;
            await this.plugin.saveSettings();
          })
      );

    // Configuración del idioma de destino
    new Setting(containerEl)
      .setName('Idioma de destino')
      .setDesc('Selecciona el idioma al que deseas traducir.')
      .addDropdown(dropdown =>
        dropdown
          .addOption('en', 'Inglés')
          .addOption('es', 'Español')
          .addOption('de', 'Alemán')
          .addOption('it', 'Italiano')
          .addOption('pt', 'Portugués')
          .addOption('ru', 'Ruso')
          .setValue(this.plugin.settings.targetLanguage)
          .onChange(async value => {
            this.plugin.settings.targetLanguage = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
