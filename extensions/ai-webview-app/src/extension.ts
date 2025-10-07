import * as vscode from 'vscode';
import { AIWebviewProvider } from './aiWebviewProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI Webview App extension is now active!');

    // Register the webview provider
    const provider = new AIWebviewProvider(context.extensionUri);

    // Register the command to open the AI app
    const disposable = vscode.commands.registerCommand('ai-webview-app.open', () => {
        // Create and show a new webview panel that takes up the main editor area
        const panel = vscode.window.createWebviewPanel(
            'aiWebviewApp',
            'AI Webview App',
            vscode.ViewColumn.One, // This makes it take up the main editor area
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [context.extensionUri]
            }
        );

        // Set the webview's initial html content
        panel.webview.html = provider.getWebviewContent();

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'loadWebsite':
                        provider.loadWebsite(panel.webview, message.url);
                        return;
                    case 'sendMessage':
                        provider.sendMessage(panel.webview, message.text);
                        return;
                    case 'setApiKey':
                        provider.setApiKey(message.apiKey);
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
