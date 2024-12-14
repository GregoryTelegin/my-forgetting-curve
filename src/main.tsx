import {App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Menu} from 'obsidian'
import {ItemView, WorkspaceLeaf} from 'obsidian'
import {Root, createRoot} from 'react-dom/client'
import ParentComponent from './components/App'

import {StrictMode} from 'react'

interface Note {
  title: string;
  key: string;
  children: Note[];
}

// Remember to rename these classes and interfaces!
const VIEW_TYPE_FORGETTING_CURVES = 'forgetting-curves-view'

interface MyForgettingCurvesSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyForgettingCurvesSettings = {
  mySetting: 'default',
}

export default class MyForgettingCurvesPlugin extends Plugin {
  settings?: MyForgettingCurvesSettings

  async onload() {
    await this.loadSettings()
    this.settings = Object.assign({}, await this.loadData());

    this.addSettingTab(new SampleSettingTab(this.app, this))
    // Регистрируем пользовательский вид
    this.registerView(
      VIEW_TYPE_FORGETTING_CURVES,
      (leaf) => new ExampleView(leaf),
    )

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon('album', 'Sample Plugin', (evt: MouseEvent) => {
      // Called when the user clicks the icon.
      new Notice('Hi, i\'m Notice!')
    })

    // Perform additional things with the ribbon
    ribbonIconEl.addClass('my-plugin-ribbon-class')

    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    const statusBarItemEl = this.addStatusBarItem()
    statusBarItemEl.setText('Status Bar Text')

    // This adds a complex command that can check whether the current state of the app allows execution of the command
    this.addCommand({
      id: 'open-sample-modal-complex',
      name: 'Open sample modal (complex)',
      checkCallback: (checking: boolean) => {
        // Conditions to check
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (markdownView) {
          // If checking is true, we're simply "checking" if the command can be run.
          // If checking is false, then we want to actually perform the operation.
          if (!checking) {
            new SampleModal(this.app).open()
          }

          // This command will only show up in Command Palette when the check function returns true
          return true
        }
      },
    })

    // Добавляем команду для открытия вида
    this.addCommand({
      id: 'open-example-view',
      name: 'Open Example View',
      callback: () => this.activateExampleView(),
    })
  }

  async activateExampleView() {
    // Проверяем, существует ли уже открытый вид
    const existingLeaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_FORGETTING_CURVES)[0]
    if (existingLeaf) {
      this.app.workspace.revealLeaf(existingLeaf)
      return
    }

    // Создаём новый вид, если он не открыт
    const leaf = this.app.workspace.getRightLeaf(false)
    await leaf.setViewState({
      type: VIEW_TYPE_FORGETTING_CURVES,
    })
    this.app.workspace.revealLeaf(leaf)

    this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
      console.log('click', evt)
    })

    this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000))
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app)
  }

  onClose() {
    const {contentEl} = this
    contentEl.empty()
  }
}

class SampleSettingTab extends PluginSettingTab {
  private root: Root | null = null;
  plugin: MyForgettingCurvesPlugin;

  constructor(app: App, plugin: MyForgettingCurvesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  async display(): Promise<void> {
    const { containerEl } = this;

    // Если уже есть root, просто рендерим новый компонент
    if (!this.root) {
      this.root = createRoot(containerEl);
    }

    // Загружаем настройки
    const settings = await this.plugin.loadData();
    const notes = settings.notes || [];

    // Рендерим React-компонент
    this.root.render(
      <StrictMode>
        <ParentComponent
          initialNotes={notes}
          onSave={async (updatedNotes) => {
            console.warn('UPDATED NOTES', updatedNotes)
            const data = await this.plugin.loadData();
            await this.plugin.saveData({ ...data, notes: updatedNotes });
          }}
        />
      </StrictMode>
    );
  }

  async onClose() {
    // Корректно размонтируем React Root
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
const testData = [{
  title: 'Первая заметка',
  key: 'Первая заметка',
  children: [
    {
      title: 'Первая вложенная заметка',
      key: 'Первая вложенная заметка',
      children: [],
    },
    {
      title: 'Вторая вложенная заметка',
      key: 'Вторая вложенная заметка',
      children: [],
    },
  ],
}]


class ExampleView extends ItemView {
  root: Root | null = null

  constructor(leaf: WorkspaceLeaf) {
    super(leaf)
  }

  getViewType() {
    return VIEW_TYPE_FORGETTING_CURVES
  }

  getDisplayText() {
    return 'Example view'
  }

  async onClose() {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
  }
}

