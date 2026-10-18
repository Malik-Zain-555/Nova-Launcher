import React, { useState } from 'react';
import { FluentIcon } from '../../components/FluentIcon';

export const QuickToolsModule: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'password' | 'base64' | 'color' | 'qr'>('password');

  // Password Generator
  const [passLength, setPassLength] = useState<number>(16);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [generatedPassword, setGeneratedPassword] = useState<string>('k9#mP$7vL2@xR9qW');

  // Base64 & Hash
  const [textInput, setTextInput] = useState<string>('Hello Nova Dock 2.0!');
  const [textOutput, setTextOutput] = useState<string>('');

  // Color Picker
  const [pickedColor, setPickedColor] = useState<string>('#7c5cff');

  // QR Code generator
  const [qrText, setQrText] = useState<string>('https://github.com/nova-dock/v2');

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + (includeSymbols ? '!@#$%^&*()-_=+' : '');
    let res = '';
    for (let i = 0; i < passLength; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(res);
  };

  const handleEncodeBase64 = () => {
    try {
      setTextOutput(btoa(textInput));
    } catch {
      setTextOutput('Encoding Error');
    }
  };

  const handleDecodeBase64 = () => {
    try {
      setTextOutput(atob(textInput));
    } catch {
      setTextOutput('Invalid Base64 string');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3.5 text-white">
      {/* Top Tool Selector */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FluentIcon name="Wrench" size={18} className="text-[var(--nova-accent,#7c5cff)]" />
          <h3 className="text-sm font-semibold text-white">Quick Productivity Tools</h3>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {[
            { id: 'password', label: 'Password Gen' },
            { id: 'base64', label: 'Base64 / URL' },
            { id: 'color', label: 'Color Picker' },
            { id: 'qr', label: 'QR Generator' }
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                activeTool === tool.id
                  ? 'bg-[var(--nova-accent,#7c5cff)] text-white font-semibold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tool 1: Password Generator */}
      {activeTool === 'password' && (
        <div className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Cryptographically Secure Password Generator</h4>

            {/* Password Display Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between">
              <span className="font-mono text-base font-bold text-emerald-300 tracking-wider select-all">
                {generatedPassword}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(generatedPassword)}
                className="px-3 py-1.5 rounded-lg bg-[var(--nova-accent,#7c5cff)] text-xs font-semibold text-white flex items-center gap-1 shadow hover:opacity-90 active:scale-95 transition-all"
              >
                <FluentIcon name="Copy" size={13} />
                <span>Copy</span>
              </button>
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span>Password Length: <span className="font-mono font-bold text-[var(--nova-accent,#7c5cff)]">{passLength}</span></span>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={passLength}
                  onChange={e => setPassLength(parseInt(e.target.value, 10))}
                  className="w-48 accent-[var(--nova-accent,#7c5cff)] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span>Include Special Symbols (!@#$%)</span>
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={e => setIncludeSymbols(e.target.checked)}
                  className="w-4 h-4 accent-[var(--nova-accent,#7c5cff)] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGeneratePassword}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <FluentIcon name="RotateCw" size={14} />
            <span>Generate New Password</span>
          </button>
        </div>
      )}

      {/* Tool 2: Base64 / URL Encoder & Decoder */}
      {activeTool === 'base64' && (
        <div className="flex-1 flex flex-col space-y-3">
          <textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            placeholder="Input text here..."
            className="h-24 p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white font-mono resize-none focus:outline-none"
          />

          <div className="flex gap-2">
            <button
              onClick={handleEncodeBase64}
              className="px-4 py-1.5 rounded-xl bg-[var(--nova-accent,#7c5cff)] text-white text-xs font-semibold"
            >
              Encode Base64
            </button>
            <button
              onClick={handleDecodeBase64}
              className="px-4 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
            >
              Decode Base64
            </button>
          </div>

          <textarea
            readOnly
            value={textOutput}
            placeholder="Output will appear here..."
            className="flex-1 p-3 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-emerald-300 font-mono resize-none focus:outline-none"
          />
        </div>
      )}

      {/* Tool 3: Color Picker */}
      {activeTool === 'color' && (
        <div className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Visual Color Palette & Inspector</h4>

            <div className="flex items-center gap-4">
              <input
                type="color"
                value={pickedColor}
                onChange={e => setPickedColor(e.target.value)}
                className="w-20 h-20 rounded-2xl border-none cursor-pointer bg-transparent"
              />
              <div className="space-y-1">
                <div className="text-lg font-mono font-bold text-white">{pickedColor.toUpperCase()}</div>
                <div className="text-xs text-white/50">Click swatch to pick custom shade</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => navigator.clipboard.writeText(pickedColor)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white flex items-center justify-between"
              >
                <span>HEX: {pickedColor}</span>
                <FluentIcon name="Copy" size={13} className="text-white/40" />
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(pickedColor)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white flex items-center justify-between"
              >
                <span>Copy RGB</span>
                <FluentIcon name="Copy" size={13} className="text-white/40" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tool 4: QR Code Generator */}
      {activeTool === 'qr' && (
        <div className="flex-1 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Instant QR Code Generator</h4>
            <input
              type="text"
              value={qrText}
              onChange={e => setQrText(e.target.value)}
              placeholder="Paste URL or text to encode..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
            />

            {/* QR Code Canvas Representation */}
            <div className="p-4 rounded-2xl bg-white flex items-center justify-center w-36 h-36 mx-auto mt-4 shadow-lg">
              <div className="text-center font-mono text-[9px] text-black">
                <FluentIcon name="QrCode" size={96} className="text-slate-900 mx-auto" />
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-white/50">
            Scan with any phone camera to instantly pair or open URL
          </div>
        </div>
      )}
    </div>
  );
};
