import React from 'react';

export default function CapaLogo({ className, variant = 'default' }: { className?: string, variant?: 'default' | 'sidebar' }) {
  const darkBlue = variant === 'sidebar' ? '#FFFFFF' : '#1A3B5C';
  const teal = variant === 'sidebar' ? '#46DDC5' : '#2A8B8C';

  return (
    <svg 
      className={`object-contain ${className || ''}`}
      viewBox="0 0 600 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Text Group */}
      <g transform="translate(0, 60)">
        <text x="120" y="0" fontFamily="Montserrat, system-ui, sans-serif" fontWeight="800" fontSize="64" fill={darkBlue} letterSpacing="-1">
          CAPA
        </text>
        
        <text x="300" y="-5" fontFamily="Arial, sans-serif" fontWeight="300" fontSize="64" fill={teal}>
          |
        </text>
        
        <text x="320" y="0" fontFamily="Montserrat, system-ui, sans-serif" fontWeight="800" fontSize="64" fill={teal} letterSpacing="-1">
          ERP
        </text>
        
        <text x="300" y="30" textAnchor="middle" fontFamily="Montserrat, system-ui, sans-serif" fontWeight="700" fontSize="14" fill={darkBlue} letterSpacing="0.5">
          CORRECTIVE ACTIONS AND CONTINUOUS IMPROVEMENT
        </text>
      </g>
    </svg>
  );
}
