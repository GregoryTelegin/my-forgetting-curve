import {App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Menu} from 'obsidian'
import {ItemView, WorkspaceLeaf} from 'obsidian'
import {Root, createRoot} from 'react-dom/client'
import SettingsApp from './components/SettingsApp'
import {StrictMode} from 'react'
import {Note} from '~/components/types/note'

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
    this.registerView(
      VIEW_TYPE_FORGETTING_CURVES,
      (leaf) => new ExampleView(leaf),
    )

    const ribbonIconEl = this.addRibbonIcon('album', 'Sample Plugin', (evt: MouseEvent) => {
      new Notice('Hi, i\'m Notice!')
    })

    ribbonIconEl.addClass('my-plugin-ribbon-class')

    const statusBarItemEl = this.addStatusBarItem()
    statusBarItemEl.setText('Status Bar Text')

    this.addCommand({
      id: 'open-sample-modal-complex',
      name: 'Open sample modal (complex)',
      checkCallback: (checking: boolean) => {
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (markdownView) {
          if (!checking) {
            new SampleModal(this.app).open()
          }

          return true
        }
      },
    })

    this.addCommand({
      id: 'open-example-view',
      name: 'Open Example View',
      callback: () => this.activateExampleView(),
    })
  }

  async activateExampleView() {
    const existingLeaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_FORGETTING_CURVES)[0]
    if (existingLeaf) {
      this.app.workspace.revealLeaf(existingLeaf)
      return
    }

    const leaf = this.app.workspace.getRightLeaf(false);

    if (leaf === null) {
      return;
    }

    await leaf.setViewState({
      type: VIEW_TYPE_FORGETTING_CURVES,
    })
    this.app.workspace.revealLeaf(leaf);

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

    if (!this.root) {
      this.root = createRoot(containerEl);
    }

    const settings = await this.plugin.loadData();
    const notes = settings.notes || [];

    const onSaveHandler = async (updatedNotes: Note[]) => {
      console.warn('UPDATED NOTES', updatedNotes)
      const data = await this.plugin.loadData();
      await this.plugin.saveData({ ...data, notes: updatedNotes });
    }


    this.root.render(
      <StrictMode>
        <SettingsApp
          initialNotes={notes}
          onSave={onSaveHandler}
        />
      </StrictMode>
    );
  }

  async onClose() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

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

