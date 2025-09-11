/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { EditorInputCapabilities, IUntypedEditorInput } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IssueReporterData } from './issueReporterModel.js';

const issueReporterEditorIcon = registerIcon('issue-reporter-editor-label-icon', Codicon.report, localize('issueReporterEditorLabelIcon', 'Icon of the issue reporter editor label.'));

export const ISSUE_REPORTER_INPUT_ID = 'workbench.input.issueReporter';

export class IssueReporterEditorInput extends EditorInput {
	static readonly ID: string = ISSUE_REPORTER_INPUT_ID;

	static readonly RESOURCE = URI.from({
		scheme: 'issue-reporter',
		path: 'default'
	});

	private static _instance: IssueReporterEditorInput;
	static get instance() {
		if (!IssueReporterEditorInput._instance || IssueReporterEditorInput._instance.isDisposed()) {
			IssueReporterEditorInput._instance = new IssueReporterEditorInput();
		}

		return IssueReporterEditorInput._instance;
	}

	private _data: IssueReporterData | undefined;

	get data(): IssueReporterData | undefined {
		return this._data;
	}

	set data(value: IssueReporterData | undefined) {
		this._data = value;
	}

	override get typeId(): string { return IssueReporterEditorInput.ID; }
	override get editorId(): string | undefined { return IssueReporterEditorInput.ID; }
	override get resource(): URI | undefined { return IssueReporterEditorInput.RESOURCE; }
	override get capabilities() { return EditorInputCapabilities.Readonly | EditorInputCapabilities.Singleton; }

	override getName(): string {
		return localize('issueReporterInputName', "Issue Reporter");
	}

	override getIcon(): ThemeIcon {
		return issueReporterEditorIcon;
	}

	override matches(other: EditorInput | IUntypedEditorInput): boolean {
		if (super.matches(other)) {
			return true;
		}

		return other instanceof IssueReporterEditorInput;
	}
}
