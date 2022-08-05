import { FC, useEffect, useRef } from "react";
import { connect, mapProps } from "@formily/react";
import { editor } from "monaco-editor";

export const MonacoComponent: FC<{
  value?: string;
  onInput?: (value?: string) => Promise<void>;
  readOnly?: boolean;
  className?: string;
  mounted?: boolean;
}> = ({ value, onInput, readOnly, className, mounted }) => {
  const ref = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<editor.IStandaloneCodeEditor>();

  useEffect(() => {
    if (ref.current) {
      monacoRef.current = editor.create(ref.current, {
        value,
        language: "yaml",
        theme: "vs-dark",
        readOnly,
      });
      monacoRef.current.onDidChangeModelContent(async () => {
        await onInput?.(monacoRef.current?.getValue());
      });
      return () => {
        monacoRef.current?.dispose();
      };
    }
  }, [mounted]);

  return (
    <div className={`h-100 ${className || ""}`}>
      <div className={"h-full"} ref={ref} />
    </div>
  );
};

const Monaco = connect(
  MonacoComponent,
  mapProps({
    value: true,
    onInput: true,
    readOnly: true,
    mounted: true,
  })
);

export default Monaco;
