import Editor from "@monaco-editor/react";
import { useRef } from "react";
import * as monaco from "monaco-editor";

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
  language?: string; // Option to specify a language
  height?: string; // Option to customize height
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any; // Allow passing Monaco Editor options
}

export const CodeEditor: React.FC<Readonly<CodeEditorProps>> = ({
  code,
  onChange,
  language = "typescript", // Default to TypeScript
  height = "90vh", // Default height
  options = {}, // Default options
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  

  return (
    <Editor
      height={height}
      language={language}
      value={code}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        automaticLayout: true,
        ...options, // Allow custom options to override defaults
      }}
    />
  );
};
