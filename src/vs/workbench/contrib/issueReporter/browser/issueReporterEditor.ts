/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Dimension, IDomPosition } from '../../../../base/browser/dom.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { IssueReporterModel } from './issueReporterModel.js';

export const ISSUE_REPORTER_EDITOR_ID = 'workbench.editor.issueReporter';
export const ISSUE_REPORTER_INPUT_ID = 'workbench.input.issueReporter';


export class IssueReporterEditor extends EditorPane {

	static readonly ID: string = ISSUE_REPORTER_EDITOR_ID;

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
		this.issueReporterControl = this.instantiationService.createInstance(IssueReporterControl, parent);
	}
	override layout(dimension: Dimension, position?: IDomPosition): void {
		this.issueReporterControl?.layout(dimension, position);
	}
}

export class IssueReporterControl extends Disposable {

	private dimensions: Dimension | undefined = undefined;
	private readonly model: IssueReporterModel;

	constructor(parent: HTMLElement) {
		super();
		this.model = new IssueReporterModel();
	}

	protected create(parent: HTMLElement): void {
		this.createIssueReporterPage(parent);
	}

	private createIssueReporterPage(parent: HTMLElement): void {


	}
}
