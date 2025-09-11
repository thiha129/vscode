/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from '../../../../nls.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions, IWorkbenchContributionsRegistry, IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IEditorSerializer, EditorExtensions, IEditorFactoryRegistry } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.js';
import { IEditorResolverService, RegisteredEditorPriority } from '../../../services/editor/common/editorResolverService.js';
import { IssueFormService } from './issueFormService.js';
import { BrowserIssueService } from './issueService.js';
import './issueTroubleshoot.js';
import { IIssueFormService, IWorkbenchIssueService } from '../common/issue.js';
import { BaseIssueContribution } from '../common/issue.contribution.js';
import { IssueReporterEditorInput } from './issueReporterEditorInput.js';
import { localize } from '../../../../nls.js';

//#region --- issue reporter editor

class IssueReporterEditorContribution implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.issueReporterEditor';

	constructor(
		@IEditorResolverService editorResolverService: IEditorResolverService,
		@IInstantiationService instantiationService: IInstantiationService
	) {
		editorResolverService.registerEditor(
			`${IssueReporterEditorInput.RESOURCE.scheme}:**/**`,
			{
				id: IssueReporterEditorInput.ID,
				label: localize('promptOpenWith.issueReporter.displayName', "Issue Reporter"),
				priority: RegisteredEditorPriority.exclusive
			},
			{
				singlePerResource: false,
				canSupportResource: resource => resource.scheme === IssueReporterEditorInput.RESOURCE.scheme
			},
			{
				createEditorInput: ({ resource, options }) => {
					return {
						editor: IssueReporterEditorInput.getInstance(),
						options: {
							pinned: true,
							...options
						}
					};
				}
			}
		);
	}
}

registerWorkbenchContribution2(IssueReporterEditorContribution.ID, IssueReporterEditorContribution, WorkbenchPhase.BlockStartup);

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
