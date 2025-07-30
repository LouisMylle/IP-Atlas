import { Globe, Lock, Tag } from 'lucide-react';

export interface LabelStyle {
  className: string;
  icon: any;
  displayText: string;
}

export function getLabelStyle(label: string | undefined): LabelStyle {
  if (!label || typeof label !== 'string' || label.trim().length === 0) {
    return {
      className: 'label-badge label-public',
      icon: Globe,
      displayText: 'Public'
    };
  }

  const normalizedLabel = label.trim().toLowerCase();
  
  if (normalizedLabel === 'public') {
    return {
      className: 'label-badge label-public',
      icon: Globe,
      displayText: 'Public'
    };
  }
  
  if (normalizedLabel === 'private') {
    return {
      className: 'label-badge label-private',
      icon: Lock,
      displayText: 'Private'
    };
  }
  
  // Custom label - truncate if too long
  const displayText = label.length > 12 ? label.substring(0, 12) + '...' : label;
  
  return {
    className: 'label-badge label-custom',
    icon: Tag,
    displayText: displayText
  };
}