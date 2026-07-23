import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface GoogleOfficialIconProps {
  size?: number;
}

export const GoogleOfficialIcon: React.FC<GoogleOfficialIconProps> = ({ size = 20 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Blue Path */}
      <Path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.16h6.6c-.28 1.48-1.12 2.74-2.38 3.58v2.97h3.85c2.25-2.07 3.675-5.12 3.675-8.64z"
      />
      {/* Green Path */}
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.85-2.97c-1.08.72-2.45 1.16-4.08 1.16-3.14 0-5.8-2.12-6.75-4.97H1.36v3.07C3.33 21.3 7.39 24 12 24z"
      />
      {/* Yellow Path */}
      <Path
        fill="#FBBC05"
        d="M5.25 14.31c-.25-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31V6.62H1.36C.49 8.35 0 10.12 0 12s.49 3.65 1.36 5.38l3.89-3.07z"
      />
      {/* Red Path */}
      <Path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.39 0 3.33 2.7 1.36 6.62l3.89 3.07c.95-2.85 3.61-4.94 6.75-4.94z"
      />
    </Svg>
  );
};
