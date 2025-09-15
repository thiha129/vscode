/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from '../../../../nls.js';
import { localize } from '../../../../nls.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorPaneDescriptor, IEditorPaneRegistry } from '../../../browser/editor.js';
import { Extensions, IWorkbenchContributionsRegistry } from '../../../common/contributions.js';
import { EditorExtensions, IEditorFactoryRegistry, IEditorSerializer } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.js';
import { BaseIssueContribution } from '../common/issue.contribution.js';
import { IIssueFormService, IWorkbenchIssueService } from '../common/issue.js';
import { IssueFormService } from './issueFormService.js';
import { IssueReporterEditor } from './issueReporterEditor.js';
import { IssueReporterEditorInput } from './issueReporterEditorInput.js';
import { BrowserIssueService } from './issueService.js';
import './issueTroubleshoot.js';

//#region --- register issue reporter editor pane

Registry.as<IEditorPaneRegistry>(EditorExtensions.EditorPane).registerEditorPane(
	EditorPaneDescriptor.create(IssueReporterEditor, IssueReporterEditor.ID, localize('issueReporter', "Issue Reporter")),
	[new SyncDescriptor(IssueReporterEditorInput)]
);

//#endregion

//#region --- issue reporter editor

class IssueReporterEditorInputSerializer implements IEditorSerializer {

	canSerialize(editorInput: EditorInput): boolean {
		return true;
	}

	serialize(editorInput: EditorInput): string {
		return '';
	}

	deserialize(instantiationService: IInstantiationService): EditorInput {
		return IssueReporterEditorInput.getInstance();
	}
}

Registry.as<IEditorFactoryRegistry>(EditorExtensions.EditorFactory).registerEditorSerializer(IssueReporterEditorInput.ID, IssueReporterEditorInputSerializer);

//#endregion


class WebIssueContribution extends BaseIssueContribution {
	constructor(@IProductService productService: IProductService, @IConfigurationService configurationService: IConfigurationService) {
		super(productService, configurationService);
		Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
			properties: {
				'issueReporter.experimental.webReporter': {
					type: 'boolean',
					default: productService.quality !== 'stable',
					description: 'Enable experimental issue reporter for web.',
				},
			}
		});
	}
}

Registry.as<IWorkbenchContributionsRegistry>(Extensions.Workbench).registerWorkbenchContribution(WebIssueContribution, LifecyclePhase.Restored);

registerSingleton(IWorkbenchIssueService, BrowserIssueService, InstantiationType.Delayed);
registerSingleton(IIssueFormService, IssueFormService, InstantiationType.Delayed);

CommandsRegistry.registerCommand('_issues.getSystemStatus', (accessor) => {
	return nls.localize('statusUnsupported', "The --status argument is not yet supported in browsers.");
});
