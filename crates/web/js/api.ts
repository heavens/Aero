/**
 * This serves as an api for any types that wish to be exposed at the rust layer.
 */

export type InitRequest = {
  // The request id, also known as the request typename.
  type: string;
  // The base uri, or domain, of the workspace.
  uri: string;
  // The directory in which the workspace will be initialized with.
  path?: string;
}

export type NotifyInitialized = {
  window_id: number;
  browser?: boolean;
};
