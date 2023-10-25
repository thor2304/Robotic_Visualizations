export class CodeBlock {
    constructor(language, code) {
        this.language = language;
        this.code = code;
    }

    toMarkdown() {
        return "```" + this.language + "\n"
            + this.code + "\n```"
    }
}