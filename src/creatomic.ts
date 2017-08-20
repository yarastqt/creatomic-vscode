import { window, workspace, commands } from 'vscode'
import { resolve } from 'path'
import * as fs from 'fs'
import * as deepmerge from 'deepmerge'

import { mkdirp } from './utils'


class CreatomicController {
  private config

  constructor() {
    this.registerCommands()
  }

  registerCommands() {
    commands.registerCommand('creatomic.create', this.create)
  }

  create = () => {
    if (!workspace.rootPath) {
      window.showInformationMessage('Open a project to continue.')
      return
    }

    this.config = this.getConfiguration()

    const quickPickOptions = {
      matchOnDescription: true,
      placeHolder: 'Choose type',
    }

    const typesAvailable = [
      { label: 'Atom', description: 'Create atom component' },
      { label: 'Organism', description: 'Create organism component' },
      { label: 'Template', description: 'Create template component' },
      { label: 'Page', description: 'Create page component' },
      { label: 'Create structure', description: 'Create atomic files structure' },
    ]

    window.showQuickPick(typesAvailable, quickPickOptions)
      .then((selection) => {
        if (!selection) {
          return
        }

        switch (selection.label) {
          case 'Create structure':
            return this.createStructure()

          case 'Atom':
          case 'Organism':
          case 'Template':
          case 'Page':
            // TODO: createComponent
        }
      })
  }

  createStructure() {
    const { naming: { atoms, organisms, templates, pages } } = this.config
    const foldersNaming = [atoms, organisms, templates, pages]

    foldersNaming.forEach((folderName) => {
      this.createStructureFolder(folderName)
    })

    window.showInformationMessage('Structure created successfully.')
  }

  createStructureFolder(folderName) {
    const workspaceRoot = workspace.rootPath
    const { rootDirectory, fileExtensions, naming: { components } } = this.config
    const componentFolderSource = resolve(workspaceRoot, rootDirectory, components, folderName)

    mkdirp(componentFolderSource)
      .then(() => {
        const componentIndexSource = resolve(componentFolderSource, `index.${fileExtensions}`)
        
        if (!fs.existsSync(componentIndexSource)) {
          try {
            fs.appendFileSync(componentIndexSource, '')
          }
          catch (error) {
            window.showErrorMessage(`Cannot create index for ${folderName}.`)
          }
        }
      })
      .catch(() => {
        window.showErrorMessage(`Cannot create directory of: ${folderName}.`)
      })
  }

  getConfiguration() {
    const workspaceRoot = workspace.rootPath
    const defaultConfig = workspace.getConfiguration('creatomic')
    const projectConfigSource = resolve(workspaceRoot, '.creatomicrc')

    if (fs.existsSync(projectConfigSource)) {
      const content = fs.readFileSync(projectConfigSource, 'utf8')

      if (content) {
        const projectConfig = JSON.parse(content)
        return deepmerge(defaultConfig, projectConfig)
      }
    }

    return defaultConfig
  }

  dispose() {}
}

export default CreatomicController
