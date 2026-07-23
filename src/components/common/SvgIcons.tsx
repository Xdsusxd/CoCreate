import React from 'react';
import Svg, { Path, Line, Rect, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

/** Official Google 4-color "G" logo */
export const GoogleOfficialIcon: React.FC<IconProps> = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.16h6.6c-.28 1.48-1.12 2.74-2.38 3.58v2.97h3.85c2.25-2.07 3.675-5.12 3.675-8.64z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.85-2.97c-1.08.72-2.45 1.16-4.08 1.16-3.14 0-5.8-2.12-6.75-4.97H1.36v3.07C3.33 21.3 7.39 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.25 14.31c-.25-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31V6.62H1.36C.49 8.35 0 10.12 0 12s.49 3.65 1.36 5.38l3.89-3.07z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.39 0 3.33 2.7 1.36 6.62l3.89 3.07c.95-2.85 3.61-4.94 6.75-4.94z"
    />
  </Svg>
);

/** Fine 1px diagonal line icon for asymmetric editorial avatar box */
export const AsymmetricDiagonalIcon: React.FC<IconProps> = ({ size = 28, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 28 28">
    <Line x1="2" y1="26" x2="26" y2="2" stroke={color} strokeWidth="1" />
  </Svg>
);

/** Checkmark icon */
export const CheckIcon: React.FC<IconProps> = ({ size = 14, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20 6L9 17l-5-5"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Close / Dismiss icon */
export const CloseIcon: React.FC<IconProps> = ({ size = 14, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M18 6L6 18M6 6l12 12"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Menu Burger (3 lines) */
export const MenuIcon: React.FC<IconProps> = ({ size = 24, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

/** Plus / Add icon */
export const PlusIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

/** Home / Hub icon */
export const HomeIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12h6v10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Gallery / Grid / Projects icon */
export const ProjectIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="2" fill="none" />
    <Rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="2" fill="none" />
    <Rect x="14" y="14" width="7" height="7" stroke={color} strokeWidth="2" fill="none" />
    <Rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="2" fill="none" />
  </Svg>
);

/** Milestone / Flag icon */
export const MilestoneIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke={color} strokeWidth="2" fill="none" />
    <Line x1="4" y1="22" x2="4" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

/** Filter / Tune icon */
export const FilterIcon: React.FC<IconProps> = ({ size = 18, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Chevron Right / Back icon */
export const ChevronIcon: React.FC<IconProps & { direction?: 'left' | 'right' | 'down' | 'up' }> = ({
  size = 20,
  color = '#000000',
  direction = 'right',
}) => {
  const getRotation = () => {
    switch (direction) {
      case 'left': return '180deg';
      case 'down': return '90deg';
      case 'up': return '270deg';
      default: return '0deg';
    }
  };

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: [{ rotate: getRotation() }] }}
    >
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

/** User / Profile icon */
export const UserIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" fill="none" />
  </Svg>
);

/** Logout / Exit icon */
export const LogoutIcon: React.FC<IconProps> = ({ size = 20, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    <Path d="M16 17l5-5-5-5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

/** Gamepad icon for 'game' type */
export const GameIcon: React.FC<IconProps> = ({ size = 18, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="2" y="6" width="20" height="12" rx="4" stroke={color} strokeWidth="2" fill="none" />
    <Line x1="6" y1="12" x2="10" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="10" x2="8" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="16" cy="10" r="1" fill={color} />
    <Circle cx="18" cy="12" r="1" fill={color} />
  </Svg>
);

/** Code / Software icon */
export const CodeIcon: React.FC<IconProps> = ({ size = 18, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/** Design / Palette icon */
export const DesignIcon: React.FC<IconProps> = ({ size = 18, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2a10 10 0 1 0 10 10c0-1.5-1.2-2.7-2.7-2.7h-2.3a1.5 1.5 0 0 1-1.5-1.5V6.5C15.5 4 14 2 12 2z" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="7.5" cy="8.5" r="1.5" fill={color} />
    <Circle cx="12" cy="6.5" r="1.5" fill={color} />
    <Circle cx="16.5" cy="8.5" r="1.5" fill={color} />
  </Svg>
);

/** Music / Audio icon */
export const MusicIcon: React.FC<IconProps> = ({ size = 18, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth="2" fill="none" />
  </Svg>
);

/** Marketing / Megaphone icon */
export const MarketingIcon: React.FC<IconProps> = ({ size = 18, color = '#000000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M3 11l19-9-7 17-4-5-8-3z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
