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
import { IssueReporterData } from '../common/issue.js';

const issueReporterEditorIcon = registerIcon('issue-reporter-editor-label-icon', Codicon.report, localize('issueReporterEditorLabelIcon', 'Icon of the issue reporter editor label.'));

export class IssueReporterEditorInput extends EditorInput {

	static readonly ID = 'workbench.editor.issueReporter';

	static readonly RESOURCE = URI.from({
		scheme: 'issue-reporter',
		path: 'default'
	});

	private static _instances = new Map<string, IssueReporterEditorInput>();

	static getInstance(data?: IssueReporterData): IssueReporterEditorInput {
		const key = data?.extensionId || 'default';
		let instance = IssueReporterEditorInput._instances.get(key);

		if (!instance || instance.isDisposed()) {
			instance = new IssueReporterEditorInput(data);
			IssueReporterEditorInput._instances.set(key, instance);
		}

		return instance;
	}

	override get typeId(): string { return IssueReporterEditorInput.ID; }

	override get editorId(): string | undefined { return IssueReporterEditorInput.ID; }

	override get capabilities(): EditorInputCapabilities { return EditorInputCapabilities.Readonly; }

	readonly resource = IssueReporterEditorInput.RESOURCE;

	constructor(public readonly data?: IssueReporterData) {
		super();
	}

	override getName(): string {
		if (this.data?.extensionId) {
			const extension = this.data.enabledExtensions.find(ext => ext.id === this.data?.extensionId);
			if (extension) {
				return localize('issueReporterInputNameWithExtension', "Issue Reporter ({0})", extension.displayName || extension.name);
			}
		}
		return localize('issueReporterInputName', "Issue Reporter");
	}

	override getIcon(): ThemeIcon {
		return issueReporterEditorIcon;
	}

	override matches(other: EditorInput | IUntypedEditorInput): boolean {
		if (super.matches(other)) {
			return true;
		}

		if (other instanceof IssueReporterEditorInput) {
			return this.data?.extensionId === other.data?.extensionId;
		}

		return false;
	}

	override dispose(): void {
		super.dispose();
		// Clean up from static instances map
		const key = this.data?.extensionId || 'default';
		if (IssueReporterEditorInput._instances.get(key) === this) {
			IssueReporterEditorInput._instances.delete(key);
		}
	}
}
