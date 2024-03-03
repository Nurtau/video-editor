interface UseFileReaderProps {
  onOutput(fileName: string, buffer: ArrayBuffer): void;
}

export const useFileReader = ({ onOutput }: UseFileReaderProps) => {
  const readFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (result instanceof ArrayBuffer) {
        (result as any).fileStart = 0;
        onOutput(file.name, result);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return {
    readFile,
  };
};
