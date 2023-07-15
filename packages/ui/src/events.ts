import { Subject, distinctUntilChanged } from "rxjs";
import { Theme } from "./Theme";

/**
 * The active theme state.
 */
export const activeTheme: Subject<Theme> = new Subject();

/**
 * Dispatches the current theme object to all subscribers active at the time of a new, distinct value being written 
 * to the associated state.
 */
export const onThemeChange = activeTheme.asObservable().pipe(distinctUntilChanged());

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
