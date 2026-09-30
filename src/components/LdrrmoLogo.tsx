import React from 'react';
import { UniGuardLogo } from './UniGuardLogo';

interface LdrrmoLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const LdrrmoLogo: React.FC<LdrrmoLogoProps> = ({ className = '', size = 'md' }) => {
  return <UniGuardLogo className={className} size={size} />;
};

export default LdrrmoLogo;
