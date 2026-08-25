import { useState, useEffect } from 'react';

interface EditableTextProps {
  idKey: string;
  defaultText: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'strong' | 'div';
  isAdmin: boolean;
  isEditMode: boolean;
  siteContent: Record<string, string>;
  onSave: (key: string, val: string) => void;
}

export default function EditableText({
  idKey,
  defaultText,
  className = '',
  as = 'span',
  isAdmin,
  isEditMode,
  siteContent,
  onSave
}: EditableTextProps) {
  const currentText = siteContent[idKey] ?? defaultText;
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(currentText);

  useEffect(() => {
    setTempText(currentText);
  }, [currentText]);

  const handleBlur = () => {
    setIsEditing(false);
    if (tempText !== currentText) {
      onSave(idKey, tempText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && as !== 'p' && idKey !== 'hero-desc' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  if (isAdmin && isEditMode) {
    const isParagraph = as === 'p' || tempText.length > 40 || tempText.includes('\n');
    if (isParagraph) {
      return (
        <textarea
          value={tempText}
          onChange={(e) => setTempText(e.target.value)}
          onBlur={handleBlur}
          className={`w-full bg-amber-50/80 border-2 border-dashed border-amber-500 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 text-zinc-900 font-medium transition-all ${className}`}
          rows={Math.max(2, tempText.split('\n').length)}
          id={`edit-${idKey}`}
        />
      );
    }
    return (
      <input
        type="text"
        value={tempText}
        onChange={(e) => setTempText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-amber-50/80 border-2 border-dashed border-amber-500 rounded-md px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-brand-500 text-zinc-900 font-extrabold inline-block transition-all ${className}`}
        id={`edit-${idKey}`}
      />
    );
  }

  const Tag = as;
  
  // Format multiline paragraphs naturally if tag is not span/strong
  if ((as === 'p' || as === 'div') && currentText.includes('\n')) {
    return (
      <Tag className={className} id={`text-${idKey}`}>
        {currentText.split('\n').map((line, i) => (
          <span key={i} className="block mt-1">
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className} id={`text-${idKey}`}>
      {currentText}
    </Tag>
  );
}
