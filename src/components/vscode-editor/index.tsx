import { Editor, Monaco } from "@monaco-editor/react";
import type * as monacoType from "monaco-editor";
import { forwardRef, useImperativeHandle, useRef } from "react";
import useNotification from "antd/es/notification/useNotification";
import "./vscode-editor.scss";

const TRANSPARENT = "#00000000";

interface VSCodeEditorProps {
  value?: string;
  onChange?: (value: string | undefined, event: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  genDefaultJson?: () => any;
}

interface VSCodeEditorRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string | undefined;
}

const VSCodeEditor = forwardRef<VSCodeEditorRef, VSCodeEditorProps>(
  ({ value, onChange, onBlur, placeholder, disabled, genDefaultJson }, ref) => {
    const editorRef = useRef<any>(null);
    const [notification, contextHolder] = useNotification();

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      blur: () =>
        editorRef.current?.getModel()?.setValue(editorRef.current?.getValue()),
      getValue: () => editorRef.current?.getValue(),
    }));

    const handleEditorDidMount = (
      editor: monacoType.editor.IStandaloneCodeEditor,
      monaco: Monaco
    ) => {
      editorRef.current = editor;

      // New action: generate default JSON value
      if (genDefaultJson) {
        editor.addAction({
          id: "gen-default-json",
          label: "Generate Default JSON",
          contextMenuGroupId: "navigation",
          contextMenuOrder: 1.5,
          run: (editor) => {
            const model = editor.getModel();
            if (!model) return; // should not happen
            const defaultValue = genDefaultJson();
            if (!defaultValue) {
              // should not happen
              notification.error({
                message: "Cannot generate default value",
                description: "Cannot generate default value in this situation",
              });
              return;
            }
            model.setValue(JSON.stringify(defaultValue, null, 2));
          },
        });
      }

      // Set custom theme
      monaco.editor.defineTheme("custom-theme", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#141414",
          "editor.focusBorder": TRANSPARENT,
          focusBorder: TRANSPARENT,
          "editor.lineHighlightBackground": TRANSPARENT,
          "editor.lineHighlightBorder": TRANSPARENT,
        },
      });
      monaco.editor.setTheme("custom-theme");
    };

    const handleEditorChange = (value: string | undefined) => {
      onChange?.(value, null);
    };

    const handleEditorBlur = () => {
      onBlur?.();
    };

    return (
      <div>
        {contextHolder}
        <Editor
          value={value || ""}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
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
