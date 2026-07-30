import { motion } from 'framer-motion';
import {
  Lightning, DeviceMobile, LockKey, ChartBar, Key, Buildings,
  GraduationCap, Briefcase, ChalkboardTeacher, Users, Notepad,
  PencilSimple, Megaphone, Money, Calendar, User, ChartLineUp,
  CheckCircle, XCircle, Warning, PushPin, MagnifyingGlass,
  ArrowsClockwise, ChatCircle, FileText, BookOpen, RocketLaunch,
  Gear, Student, Trash, Bank, Umbrella, Scroll, MapPin, Receipt, WarningCircle
} from '@phosphor-icons/react';

// Maps the emojis you used across the app to high-quality Phosphor icons & intrinsic colors
const ICON_DICTIONARY = {
  '⚡': { Icon: Lightning, color: '#EAB308' }, // Yellow
  '📱': { Icon: DeviceMobile, color: '#3B82F6' }, // Blue
  '📞': { Icon: DeviceMobile, color: '#3B82F6' },
  '🔒': { Icon: LockKey, color: '#6B7280' }, // Gray
  '🔐': { Icon: Key, color: '#F59E0B' }, // Amber
  '🔑': { Icon: Key, color: '#F59E0B' },
  '📊': { Icon: ChartBar, color: '#8B5CF6' }, // Purple
  '📈': { Icon: ChartLineUp, color: '#10B981' }, // Green
  '📉': { Icon: ChartLineUp, color: '#EF4444' }, // Red
  '🏫': { Icon: Buildings, color: '#3B82F6' },
  '🏢': { Icon: Buildings, color: '#3B82F6' },
  '🏠': { Icon: Buildings, color: '#3B82F6' },
  '🎓': { Icon: GraduationCap, color: '#3B82F6' },
  '📚': { Icon: BookOpen, color: '#F59E0B' },
  '🎒': { Icon: Student, color: '#EC4899' }, // Pink
  '🧑‍🎓': { Icon: Student, color: '#3B82F6' },
  '💼': { Icon: Briefcase, color: '#6B7280' },
  '💳': { Icon: Briefcase, color: '#6B7280' },
  '👨‍🏫': { Icon: ChalkboardTeacher, color: '#8B5CF6' },
  '👩‍🏫': { Icon: ChalkboardTeacher, color: '#8B5CF6' },
  '👪': { Icon: Users, color: '#10B981' },
  '👥': { Icon: Users, color: '#10B981' },
  '📋': { Icon: Notepad, color: '#6366F1' }, // Indigo
  '📝': { Icon: PencilSimple, color: '#F59E0B' },
  '✏️': { Icon: PencilSimple, color: '#F59E0B' },
  '🔔': { Icon: Megaphone, color: '#EAB308' },
  '📣': { Icon: Megaphone, color: '#EAB308' },
  '📢': { Icon: Megaphone, color: '#8B5CF6' },
  '💰': { Icon: Money, color: '#10B981' },
  '💵': { Icon: Money, color: '#10B981' },
  '🏦': { Icon: Bank, color: '#3B82F6' },
  '📅': { Icon: Calendar, color: '#8B5CF6' },
  '📆': { Icon: Calendar, color: '#8B5CF6' },
  '⏰': { Icon: Calendar, color: '#8B5CF6' },
  '👤': { Icon: User, color: '#6B7280' },
  '✅': { Icon: CheckCircle, color: '#10B981' },
  '✔️': { Icon: CheckCircle, color: '#10B981' },
  '❌': { Icon: XCircle, color: '#EF4444' },
  '🗑️': { Icon: Trash, color: '#EF4444' },
  '⚠️': { Icon: Warning, color: '#F59E0B' },
  '❗': { Icon: Warning, color: '#EF4444' },
  '🔴': { Icon: WarningCircle, color: '#EF4444' },
  '🎯': { Icon: PushPin, color: '#EF4444' },
  '📌': { Icon: PushPin, color: '#EF4444' },
  '📍': { Icon: MapPin, color: '#EF4444' },
  '🔍': { Icon: MagnifyingGlass, color: '#6B7280' },
  '🔄': { Icon: ArrowsClockwise, color: '#3B82F6' },
  '💬': { Icon: ChatCircle, color: '#14B8A6' }, // Teal
  '📑': { Icon: FileText, color: '#6366F1' },
  '📄': { Icon: FileText, color: '#6366F1' },
  '📂': { Icon: FileText, color: '#6366F1' },
  '🖨️': { Icon: FileText, color: '#6366F1' },
  '📁': { Icon: FileText, color: '#6366F1' },
  '📖': { Icon: BookOpen, color: '#3B82F6' },
  '🚀': { Icon: RocketLaunch, color: '#EC4899' },
  '⚙️': { Icon: Gear, color: '#6B7280' },
  '🏖️': { Icon: Umbrella, color: '#F59E0B' },
  '📜': { Icon: Scroll, color: '#D97706' },
  '🧾': { Icon: Receipt, color: '#6B7280' },
};

export function Icon3D({ emoji, size = 24, className = '', style = {}, colorOverride }) {
  // Look up the mapped icon, fallback to generic User if not found
  const mappedIcon = ICON_DICTIONARY[emoji] || { Icon: User, color: '#9CA3AF' };
  const PhosphorIcon = mappedIcon.Icon;
  
  // If a parent passes text-white or a specific color, we respect it via CSS. 
  // Otherwise, we use the intrinsic colorful aesthetic.
  const finalColor = colorOverride || mappedIcon.color;

  return (
    <motion.div
      // Subtle float/hover effect mimicking 3D interaction
      whileHover={{ scale: 1.1, rotate: [-2, 2, -2, 0] }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        color: finalColor,
        // Optional drop shadow to further fake depth
        filter: 'drop-shadow(0px 3px 2px rgba(0,0,0,0.08))',
        ...style
      }}
      aria-hidden="true"
    >
      <PhosphorIcon 
        size={size} 
        weight="duotone" // Duotone gives the 3D layered/transparent effect automatically
      />
    </motion.div>
  );
}

// Keep export for backward compatibility with your other files
export const ICON_MAP = Object.keys(ICON_DICTIONARY).reduce((acc, key) => {
  acc[key] = key;
  return acc;
}, {});

export default Icon3D;