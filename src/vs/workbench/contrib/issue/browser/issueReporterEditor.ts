/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Dimension } from '../../../../base/browser/dom.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { IEditorOpenContext } from '../../../common/editor.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { IssueReporterEditorInput } from './issueReporterEditorInput.js';
import { IssueReporterControl } from './issueReporterControl.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';

export class IssueReporterEditor extends EditorPane {

	static readonly ID: string = 'workbench.editor.issueReporter';

	protected issueReporterControl: IssueReporterControl | undefined = undefined;

	constructor(
		group: IEditorGroup,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IInstantiationService protected readonly instantiationService: IInstantiationService
	) {
		super(IssueReporterEditor.ID, group, telemetryService, themeService, storageService);
	}

	protected override createEditor(parent: HTMLElement): void {
		this.issueReporterControl = this._register(this.instantiationService.createInstance(IssueReporterControl, parent));
	}

	override async setInput(input: IssueReporterEditorInput, options: any, context: IEditorOpenContext, token: CancellationToken): Promise<void> {
		await super.setInput(input, options, context, token);

		if (this.issueReporterControl && input.data) {
			await this.issueReporterControl.setData(input.data);
		}
	}

	override focus(): void {
		this.issueReporterControl?.focus();
	}

	override layout(dimension: Dimension): void {
		this.issueReporterControl?.layout(dimension);
	}
}
