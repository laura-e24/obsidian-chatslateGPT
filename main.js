"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const DEFAULT_SETTINGS = {
    sourceLanguage: 'de', // Idioma de origen por defecto: alemán
    targetLanguage: 'es', // Idioma de destino por defecto: español
};
class TranslatorPlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.settings = DEFAULT_SETTINGS; // Inicializar con DEFAULT_SETTINGS
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addSettingTab(new TranslatorSettingTab(this.app, this));
            this.addCommand({
                id: 'translate-selected-text',
                name: 'Traducir texto seleccionado',
                callback: () => {
                    var _a;
                    const editor = (_a = this.app.workspace.getActiveViewOfType(obsidian_1.MarkdownView)) === null || _a === void 0 ? void 0 : _a.editor;
                    if (editor) {
                        this.translateSelectedText(editor, this.settings.targetLanguage);
                    }
                    else {
                        new obsidian_1.Notice('No hay un editor activo.');
                    }
                },
            });
            this.registerEvent(this.app.workspace.on('editor-menu', (menu, editor) => {
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
                        .onClick((evt) => __awaiter(this, void 0, void 0, function* () {
                        const subMenu = new obsidian_1.Menu();
                        subMenu.addItem(subItem => {
                            subItem.setTitle('Inglés').onClick(() => __awaiter(this, void 0, void 0, function* () {
                                yield this.translateSelectedText(editor, 'en');
                            }));
                        });
                        subMenu.addItem(subItem => {
                            subItem.setTitle('Italiano').onClick(() => __awaiter(this, void 0, void 0, function* () {
                                yield this.translateSelectedText(editor, 'it');
                            }));
                        });
                        subMenu.addItem(subItem => {
                            subItem.setTitle('Portugués').onClick(() => __awaiter(this, void 0, void 0, function* () {
                                yield this.translateSelectedText(editor, 'pt');
                            }));
                        });
                        subMenu.addItem(subItem => {
                            subItem.setTitle('Ruso').onClick(() => __awaiter(this, void 0, void 0, function* () {
                                yield this.translateSelectedText(editor, 'ru');
                            }));
                        });
                        if (evt instanceof MouseEvent) {
                            subMenu.showAtMouseEvent(evt);
                        }
                    }));
                });
            }));
        });
    }
    showTranslationText(editor, originalText, translation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (translation) {
                // const linkText = `[[${originalText} | ${translation}]]`; // Crear un enlace interno
                // const translationPopover =
                //   `[[${originalText}|Traducción]]` + `<!-- Traducción: ${translation} -->`; // Agregar la traducción como un comentario para referencia (opcional)
                // editor.replaceSelection(linkText); // Reemplaza el texto seleccionado con el enlace
                const translationText = `\n<!-- Traducción: ${translation} -->`;
                // const link = this.createInternalLinkElement(originalText);
                editor.replaceSelection(originalText + translationText);
                // const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                // const popover = new HoverPopover(view, link);
            }
            else {
                new obsidian_1.Notice('No se pudo obtener la traducción.');
            }
        });
    }
    createInternalLinkElement(originalText) {
        // Crear un elemento de enlace (<a>) como un nodo del DOM
        const linkElement = document.createElement('a');
        linkElement.classList.add('internal-link');
        linkElement.href = `#`; // Esto sería un link válido en Obsidian
        linkElement.textContent = originalText;
        return linkElement;
    }
    translateSelectedText(editor, targetLang) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedText = editor.getSelection();
            if (!selectedText) {
                new obsidian_1.Notice('Por favor, selecciona un texto primero.');
                return null; // Retorna null si no hay texto seleccionado
            }
            // Mostrar el aviso de que está cargando
            const loadingNotice = new obsidian_1.Notice('Cargando traducción...', 0); // 0 significa que el aviso se mantendrá visible
            try {
                const translation = yield this.fetchTranslation(selectedText, targetLang);
                if (translation) {
                    this.showTranslationText(editor, selectedText, translation);
                    return translation;
                }
                else {
                    new obsidian_1.Notice('No se pudo obtener la traducción.');
                    return null;
                }
            }
            finally {
                // Eliminar el aviso de carga cuando finalice la traducción
                loadingNotice.hide();
            }
        });
    }
    // Función para hacer la solicitud a la API de LibreTranslate
    fetchTranslation(text, targetLang) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('http://localhost:5000/translate', {
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
            const data = yield response.json();
            return data.translatedText || null;
        });
    }
    // Cargar configuración del plugin
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    // Guardar configuración del plugin
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
}
exports.default = TranslatorPlugin;
// Pestaña de configuración del plugin
class TranslatorSettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Configuración del Traductor' });
        // Configuración del idioma de origen
        new obsidian_1.Setting(containerEl)
            .setName('Idioma de origen')
            .setDesc('Selecciona el idioma del texto que deseas traducir.')
            .addDropdown(dropdown => dropdown
            .addOption('en', 'Inglés')
            .addOption('es', 'Español')
            .addOption('de', 'Alemán')
            .addOption('it', 'Italiano')
            .addOption('pt', 'Portugués')
            .addOption('ru', 'Ruso')
            .setValue(this.plugin.settings.sourceLanguage)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.sourceLanguage = value;
            yield this.plugin.saveSettings();
        })));
        // Configuración del idioma de destino
        new obsidian_1.Setting(containerEl)
            .setName('Idioma de destino')
            .setDesc('Selecciona el idioma al que deseas traducir.')
            .addDropdown(dropdown => dropdown
            .addOption('en', 'Inglés')
            .addOption('es', 'Español')
            .addOption('de', 'Alemán')
            .addOption('it', 'Italiano')
            .addOption('pt', 'Portugués')
            .addOption('ru', 'Ruso')
            .setValue(this.plugin.settings.targetLanguage)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.targetLanguage = value;
            yield this.plugin.saveSettings();
        })));
    }
}
// class TranslatorHoverPopOver extends HoverPopover {
//   plugin: TranslatorPlugin;
//   constructor(parent: HoverParent, targetEl: HTMLElement) {
//     super(parent, targetEl);
//     // this.plugin = plugin;
//   }
//   display(): void {
//     const { hoverEl, state } = this;
//   }
// }
