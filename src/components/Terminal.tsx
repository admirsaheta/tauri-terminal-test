// src/components/Terminal.tsx
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { invoke } from '@tauri-apps/api';

interface OutputLine {
  text: string;
  type: 'input' | 'output' | 'error';
}

const Terminal: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      executeCommand();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      navigateHistory(-1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      navigateHistory(1);
    }
  };

  const navigateHistory = (direction: number) => {
    const newIndex = Math.min(
      Math.max(historyIndex + direction, -1),
      history.length - 1
    );
    setHistoryIndex(newIndex);
    setInput(newIndex >= 0 ? history[newIndex] : '');
  };

  const executeCommand = async () => {
    if (!input.trim()) return;

    if (input.trim().toLowerCase() === 'clear') {
      setOutput([]);
      setInput('');
      return;
    }

    setHistory((prevHistory) => [input, ...prevHistory]);
    setHistoryIndex(-1);

    setOutput((prevOutput) => [...prevOutput, { text: `> ${input}`, type: 'input' }]);

    try {
      const result = await invoke<string>('execute_command', { command: input });
      setOutput((prevOutput) => [...prevOutput, { text: result, type: 'output' }]);
    } catch (error) {
      setOutput((prevOutput) => [...prevOutput, { text: `Error: ${(error as Error).message}`, type: 'error' }]);
    }

    setInput('');
  };

  return (
    <div className="bg-gray-900 text-green-400 h-screen p-4 font-mono">
      <div className="overflow-y-auto h-full">
        <pre>
          {output.map((line, index) => (
            <div key={index} className={line.type === 'error' ? 'text-red-400' : ''}>
              {line.text}
            </div>
          ))}
        </pre>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        className="w-full bg-gray-800 text-green-400 border-none p-2 mt-4"
        placeholder="Type your command here..."
      />
    </div>
  );
};

export default Terminal;
