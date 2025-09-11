/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize, localize2 } from '../../../../nls.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IEditorSerializer, EditorExtensions, IEditorFactoryRegistry } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IEditorResolverService, RegisteredEditorPriority } from '../../../services/editor/common/editorResolverService.js';
import { IssueReporterEditorInput } from './issueReporterEditorInput.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';

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
				singlePerResource: true,
				canSupportResource: resource => resource.scheme === IssueReporterEditorInput.RESOURCE.scheme
			},
			{
				createEditorInput: () => {
					return {
						editor: instantiationService.createInstance(IssueReporterEditorInput),
						options: {
							pinned: true
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
		return IssueReporterEditorInput.instance;
	}
}

Registry.as<IEditorFactoryRegistry>(EditorExtensions.EditorFactory).registerEditorSerializer(IssueReporterEditorInput.ID, IssueReporterEditorInputSerializer);

//#endregion

//#region --- issue reporter commands

class OpenIssueReporter extends Action2 {

	static readonly ID = 'workbench.action.openIssueReporter';

	constructor() {
		super({
			id: OpenIssueReporter.ID,
			title: localize2('openIssueReporter', 'Open Issue Reporter WOOHOO'),
			category: Categories.Help,
			f1: true
		});
	}

	override async run(accessor: ServicesAccessor): Promise<void> {
		const editorService = accessor.get(IEditorService);

		await editorService.openEditor({
			resource: IssueReporterEditorInput.RESOURCE,
			options: {
				pinned: true,
				revealIfOpened: true
			}
		});
	}
}

registerAction2(OpenIssueReporter);

MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
	group: '3_feedback',
	command: {
		id: OpenIssueReporter.ID,
		title: localize({ key: 'miReportIssue', comment: ['&& denotes a mnemonic'] }, "Report &&Issue")
	},
	order: 3
});

//#endregion
