var editor = CodeMirror.fromTextArea(document.getElementById("codemirror"), {
    lineNumbers: false,
    tabSize: 2,
    indentUnit: 2,
    theme: "default",
    matchBrackets: true,
    mode: "text/x-python",
});
