import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  FileText,
  GitBranch,
  Home,
  Image,
  Link,
  Mail,
  Map,
  PenLine,
  Sparkles,
  Star,
  type LucideProps,
} from 'lucide-react';

export const LINK_ICON_OPTIONS = [
  { name: 'arrow', label: 'Arrow' },
  { name: 'book', label: 'Book' },
  { name: 'briefcase', label: 'Briefcase' },
  { name: 'code', label: 'Code' },
  { name: 'external', label: 'External' },
  { name: 'file', label: 'File' },
  { name: 'git', label: 'Git' },
  { name: 'home', label: 'Home' },
  { name: 'image', label: 'Image' },
  { name: 'link', label: 'Link' },
  { name: 'mail', label: 'Mail' },
  { name: 'map', label: 'Map' },
  { name: 'pen', label: 'Pen' },
  { name: 'sparkles', label: 'Sparkles' },
  { name: 'star', label: 'Star' },
] as const;

export type LinkIconName = (typeof LINK_ICON_OPTIONS)[number]['name'];

export function LinkIcon({ name, ...props }: LucideProps & { name: string | undefined }) {
  if (name === 'arrow') return <ArrowRight {...props} />;
  if (name === 'book') return <BookOpen {...props} />;
  if (name === 'briefcase') return <BriefcaseBusiness {...props} />;
  if (name === 'code') return <Code2 {...props} />;
  if (name === 'external') return <ExternalLink {...props} />;
  if (name === 'file') return <FileText {...props} />;
  if (name === 'git') return <GitBranch {...props} />;
  if (name === 'home') return <Home {...props} />;
  if (name === 'image') return <Image {...props} />;
  if (name === 'mail') return <Mail {...props} />;
  if (name === 'map') return <Map {...props} />;
  if (name === 'pen') return <PenLine {...props} />;
  if (name === 'sparkles') return <Sparkles {...props} />;
  if (name === 'star') return <Star {...props} />;
  return <Link {...props} />;
}
