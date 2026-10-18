import React from 'react';
import * as LucideIcons from 'lucide-react';

interface FluentIconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export const FluentIcon: React.FC<FluentIconProps> = ({
  name,
  size = 18,
  className = '',
  color
}) => {
  // Normalize PascalCase name, fallback to Sparkles if not found
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Sparkles;

  return (
    <IconComponent
      size={size}
      className={`stroke-[1.75] transition-colors ${className}`}
      color={color}
    />
  );
};
