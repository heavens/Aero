export default class DocumentReader {
    private content: string;
    private cursor: number = 0;
    private line: number = 0;

    static new(line: string): DocumentReader {
        return new DocumentReader(line);
    }

    constructor(line: string) {
        this.content = line;
    }

    public * next(): Generator<string, void, string> {
        for (const char of this.content) {
            if (char == "\n") {
                this.line++;
                this.cursor = 0;
                continue;
            } 
            
            this.cursor++;
            yield char;
        }
    }
}