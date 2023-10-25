// This textMate grammar has been copied from the extension made by Ahern Guo
const grammar = {
    "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
    "name": "URScript",
    "names": ["URScript"],
    "extensions": [".urscript"],
    "scopeName": "source.urscript",
    "patterns": [
        {
            "include": "#numerics"
        },
        {
            "include": "#strings"
        },
        {
            "include": "#comments"
        },
        {
            "include": "#keywords"
        },
        {
            "include": "#constants"
        },
        {
            "include": "#methods"
        },
        {
            "include": "#hover-info"
        }
    ],
    "repository": {
        "numerics": {
            "patterns": [
                {
                    "name": "constant.numeric.float.urscript",
                    "match": "[+-]?\\b(\\d+(\\.\\d+)?)\\b"
                },
                {
                    "name": "constant.numeric.integer.urscript",
                    "match": "[+-]?\\b(\\d+)\\b"
                },
                {
                    "name": "constant.numeric.exponent.urscript",
                    "match": "[+-]?\\b(\\d+(\\.\\d+)?)[eE]{1}[+-]?\\d+\\b"
                }
            ]
        },
        "strings": {
            "patterns": [
                {
                    "name": "string.quoted.double.urscript",
                    "begin": "\"",
                    "end": "\"",
                    "patterns": [
                        {
                            "name": "constant.character.escape.urscript",
                            "match": "\\."
                        }
                    ]
                },
                {
                    "name": "string.quoted.single.urscript",
                    "begin": "'",
                    "end": "'"
                }
            ]
        },
        "comments": {
            "patterns": [
                {
                    "name": "comment.block.documentation.urscript",
                    "begin": "\\s*(###)$",
                    "end": "\\s*(###)$",
                    "patterns": [
                        {
                            "name": "comment.block.documentation.urscript",
                            "begin": "(@param)\\s+(\\w+)",
                            "end": "(none|void|bool|number|int|float|array|pose|string|struct)",
                            "beginCaptures": {
                                "1": {
                                    "name": "entity.name.tag.urscript"
                                },
                                "2": {
                                    "name": "variable.name.urscript"
                                }
                            },
                            "endCaptures": {
                                "1": {
                                    "name": "entity.name.type.urscript"
                                }
                            }
                        },
                        {
                            "name": "comment.block.documentation.urscript",
                            "begin": "(@returns)",
                            "end": "(none|void|bool|number|int|float|array|pose|string|struct)",
                            "beginCaptures": {
                                "1": {
                                    "name": "entity.name.tag.urscript"
                                }
                            },
                            "endCaptures": {
                                "1": {
                                    "name": "entity.name.type.urscript"
                                }
                            }
                        }
                    ]
                },
                {
                    "include": "#comment-base"
                }
            ]
        },
        "comment-base": {
            "patterns": [
                {
                    "name": "comment.line.number-sign.urscript",
                    "match": "(#|\\$).*$"
                }
            ]
        },
        "methods": {
            "patterns": [
                {
                    "begin": "\\b(def|thread)\\b",
                    "end": "\\(.*\\):\\s*$",
                    "beginCaptures": {
                        "1": {
                            "name": "keyword.control.urscript"
                        }
                    },
                    "contentName": "entity.name.function.urscript"
                },
                {
                    "begin": "(\\w+)(\\()",
                    "end": "\\)",
                    "beginCaptures": {
                        "1": {
                            "name": "entity.name.function.urscript"
                        }
                    },
                    "patterns": [
                        {
                            "include": "#strings"
                        },
                        {
                            "include": "#numerics"
                        },
                        {
                            "include": "#constants"
                        },
                        {
                            "include": "#methods"
                        }
                    ]
                }
            ]
        },
        "keywords": {
            "patterns": [
                {
                    "name": "keyword.control.urscript",
                    "match": "\\b(while|for|return|end|kill|halt|run|join|enter_critical|exit_critical)\\b"
                },
                {
                    "name": "keyword.control.conditional.urscript",
                    "match": "\\b(if|elif|else)\\b"
                },
                {
                    "name": "storage.modifier.urscript",
                    "match": "\\b(global|local)\\b"
                },
                {
                    "name": "keyword.operator.logical.urscript",
                    "match": "(<=|>=|!=|==|<|>)"
                },
                {
                    "name": "keyword.operator.assignment.urscript",
                    "match": "="
                },
                {
                    "name": "keyword.operator.arithmetic.urscript",
                    "match": "(\\+|-|\\*|/)"
                },
                {
                    "name": "keyword.other.urscript",
                    "match": "\\b(and|or|xor|not)\\b"
                }
            ]
        },
        "constants": {
            "patterns": [
                {
                    "name": "constant.language.urscript",
                    "match": "\\b(True|False)\\b"
                }
            ]
        },
        "hover-info": {
            "patterns": [
                {
                    "name": "support.other.urscript",
                    "begin": "^(void|bool|int|float|number|array|pose|string|struct)\\s",
                    "end": "$",
                    "beginCaptures": {
                        "1": {
                            "name": "entity.name.type.urscript"
                        }
                    },
                    "patterns": [
                        {
                            "name": "entity.name.type.urscript",
                            "match": "(none|void|bool|number|int|float|array|pose|string|struct)"
                        },
                        {
                            "name": "entity.name.function.urscript",
                            "match": "([a-zA-Z_{1}][a-zA-Z0-9_]+)(?=\\()"
                        },
                        {
                            "include": "#strings"
                        },
                        {
                            "include": "#numerics"
                        },
                        {
                            "include": "#constants"
                        }
                    ]
                }
            ]
        }
    }
}

export default grammar;