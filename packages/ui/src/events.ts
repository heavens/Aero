import { Subject, distinctUntilChanged } from "rxjs";

/**
 * The workspace status passed to event handlers.
 */
export type WorkspaceStatus = {
    title: string;
    description?: string;
}

/**
 * The status message being rendered on the status bar widget for the active workspace.
 */
export const workspaceStatus: Subject<WorkspaceStatus> = new Subject();

/**
 * Sets a new status to be displayed on the status bar widget upon a distinct value being written.
 */
export const onWorkspaceStatusUpdate = workspaceStatus.asObservable().pipe(distinctUntilChanged());

const themeUpdate = new Subject();

export const dispatchThemeUpdate = () => themeUpdate.next(null);

export const onThemeUpdate = () => themeUpdate.asObservable();
