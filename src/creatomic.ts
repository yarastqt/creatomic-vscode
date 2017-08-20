import { window, workspace, commands } from 'vscode'
import { resolve } from 'path'
import * as fs from 'fs'
import * as deepmerge from 'deepmerge'

import { mkdirp, normalizeFileName, normalizeComponentName, templater } from './utils'


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
          return this.createComponent(selection.label)
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

  createComponent(type) {
    const workspaceRoot = workspace.rootPath
    const { rootDirectory, fileExtensions, naming: { components } , fileNamingCase } = this.config

    window.showInputBox({ prompt: `${type} name` })
      .then((name) => {
        if (!name) {
          return
        }

        const componentFolderName = this.getComponentFolderName(type)
        const componentFileName = normalizeFileName(name, fileNamingCase)
        const componentFolderSource = resolve(workspaceRoot, rootDirectory, components, componentFolderName, componentFileName)

        mkdirp(componentFolderSource)
          .then(() => {
            const componentName = normalizeComponentName(name)

            this.createReExportComponentFile(componentFolderSource, componentName, componentFileName)
  
            window.showInformationMessage(`${type}: ${name} created successfully.`)
          })
          .catch(() => {
            window.showErrorMessage(`Cannot create directory of: ${componentFileName}.`)
          })
      })
  }

  createReExportComponentFile(componentFolderSource, componentName, componentFileName) {
    const { fileExtensions, templates } = this.config
    const componentIndexSource = resolve(componentFolderSource, `index.${fileExtensions}`)

    if (fs.existsSync(componentIndexSource)) {
      window.showInformationMessage(`A index.${fileExtensions} for ${componentFileName} already exists.`)
      return
    }

    try {
      const content = templater(templates.reexport, { componentName, componentFileName })
      fs.appendFileSync(componentIndexSource, content)
    }
    catch (error) {
      window.showErrorMessage(`Cannot create index for ${componentName}.`)
    }
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

  getComponentFolderName(type) {
    const { naming: { atoms, organisms, templates, pages } } = this.config

    switch (type) {
      case 'Atom':
        return atoms

      case 'Organism':
        return organisms

      case 'Template':
        return templates

      case 'Page':
        return pages

      default:
        window.showErrorMessage(`Unknown component type: ${type}.`)
    }

    return null
  }

  dispose() {}
}

export default CreatomicController
