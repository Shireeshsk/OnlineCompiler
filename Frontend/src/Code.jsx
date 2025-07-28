import React from "react";

import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";

const Code = ({ code, setCode, theme ,language}) => {
  const languageExtensions = {
    cpp: cpp(),
    java: java(),
    py: python(),
  };
  return (
    <CodeMirror
      value={code}
      height="350px"
      extensions={[languageExtensions[language]]}
      onChange={setCode}
      theme={theme === "light" ? "light" : "dark"}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLineGutter: true,
        highlightActiveLine: true,
        foldGutter: true,
        syntaxHighlighting: true,
        indentOnInput: true,
        autocompletion: false,
        bracketMatching: true,
        closeBrackets: true,
        defaultKeymap: true,
      }}
    />
  );
};

export default Code;