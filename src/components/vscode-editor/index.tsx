import { Editor } from "@monaco-editor/react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import "./vscode-editor.scss";

interface VSCodeEditorProps {
  value?: string;
  onChange?: (value: string | undefined, event: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

interface VSCodeEditorRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string | undefined;
}

const VSCodeEditor = forwardRef<VSCodeEditorRef, VSCodeEditorProps>(
  ({ value, onChange, onBlur, placeholder, disabled }, ref) => {
    const editorRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      blur: () =>
        editorRef.current?.getModel()?.setValue(editorRef.current?.getValue()),
      getValue: () => editorRef.current?.getValue(),
    }));

    const handleEditorDidMount = (editor: any) => {
      editorRef.current = editor;
    };

    const handleEditorChange = (value: string | undefined) => {
      onChange?.(value, null);
    };

    const handleEditorBlur = () => {
      onBlur?.();
    };

    return (
      <div className="vscode-editor-wrapper">
        <Editor
          value={value || ""}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          defaultLanguage="json"
          height={150}
          options={{
            minimap: { enabled: false },
            tabSize: 2,
            lineNumbers: "off",
            readOnly: disabled,
            placeholder: placeholder,
            automaticLayout: true,
            wordWrap: "on",
            scrollBeyondLastLine: false,
          }}
          className="ant-input-json"
        />
        <div style={{ display: "none" }} onBlur={handleEditorBlur} />
      </div>
    );
  }
);

export default VSCodeEditor;
