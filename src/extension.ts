import { ExtensionContext } from 'vscode'

import CreatomicController from './creatomic'


export function activate(context: ExtensionContext) {
  const controller = new CreatomicController()
  context.subscriptions.push(controller)
}
