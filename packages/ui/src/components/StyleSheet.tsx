import React from "react";
import { Subject } from "rxjs";
import { RendererIpc } from '..';

type StyleSheetProps = {
    path: string;
    sheet: StyleSheet;
};

export default class ImportedStyleSheet extends React.PureComponent<StyleSheetProps> {
    private stylesheet: Subject<StyleSheetProps>;

    componentWillUnmount(): void {
        if (this.stylesheet != null) {
            this.stylesheet.unsubscribe();
        }
    }

    render() {
        return <code></code>;
    }

    import(path: string): void {
        if (this.stylesheet != null) {
            this.stylesheet.unsubscribe();
        }

        // TODO(mack): I'll have to come back to this once the current WIP message channel design is finished. 
        // The idea is to simply post a request to the backend indicating where the stylesheet we want to import is located at.
        // Then the backend will send a response of pass or fail with the relative details.
        RendererIpc.postMessage("aero/theme/import_style", { path });
    }
}