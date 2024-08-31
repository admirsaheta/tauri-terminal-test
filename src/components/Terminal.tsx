import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api';


const Terminal = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleInput = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setInput(event.target.value);
  };

  const executeCommand = async () => {
    try {
      const result = await invoke('execute_command', { command: input });
      setOutput(result as string);
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    }
    setInput('');
  };

  return (
    <div className="bg-gray-900 text-green-400 h-screen p-4">
      <div className="overflow-y-auto h-full">
        <pre>{output}</pre>
      </div>
      <input
        type="text"
        value={input}
        onChange={handleInput}
        onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
        className="w-full bg-gray-800 text-green-400 border-none p-2 mt-4"
        placeholder="Type your command here..."
      />
    </div>
  );
};

export default Terminal;
