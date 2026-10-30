import type { ReactNode } from 'react';

type Props = { size?: number; className?: string };

const Svg = ({ size = 18, className, children }: Props & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="square"
    strokeLinejoin="miter"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

export const PlayIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M6 4v16l14-8z" fill="currentColor" />
  </Svg>
);
export const CheckIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M4 12l6 6L20 6" />
  </Svg>
);
export const AlertIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M12 3L22 20H2z" />
    <path d="M12 10v4M12 17v1" />
  </Svg>
);
export const ChevronIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);
export const MenuIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);
export const VolumeIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
    <path d="M17 9c1.5 1.5 1.5 4.5 0 6M20 6c3 3 3 9 0 12" />
  </Svg>
);
export const MuteIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
    <path d="M17 9l5 6M22 9l-5 6" />
  </Svg>
);
export const BulbIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M8 14c-3-2-3-9 4-9s7 7 4 9v3H8z" />
    <path d="M9 21h6" />
  </Svg>
);
export const TerminalIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M4 6l6 6-6 6M12 19h8" />
  </Svg>
);
export const ResetIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" />
  </Svg>
);
export const LockIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M6 11h12v9H6zM8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);
