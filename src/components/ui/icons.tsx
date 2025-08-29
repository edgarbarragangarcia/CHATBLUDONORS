import * as React from 'react';

export const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15.545 6.545a9 9 0 1 1-11.09 11.09A9 9 0 0 1 15.545 6.545Z" />
    <path d="M17 8h1a4 4 0 0 1 4 4v2" />
    <path d="M8 17a4 4 0 0 1-4-4V8" />
    <path d="M12 12v6" />
    <path d="M12 6V3" />
    <path d="m6 6 2 2" />
    <path d="m16 16 2 2" />
  </svg>
);

export const ProjectiaLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z" />
        <path d="M11.999 15.6L10.799 13.2H14.399L12.799 9.6L16.399 9.6L11.199 18L11.999 15.6Z" fill="white" />
        <path d="M12.801 8.4L14.001 6L7.60101 6L11.201 14.4L9.60101 14.4L12.801 8.4Z" fill="white" />
    </svg>
);


export const PanelsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <rect x="3" y="3" width="7" height="7" rx="1"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1"></rect>
    </svg>
);

export const AssistantIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 3L13.94 8.06L19 9.9L13.94 11.74L12 16.8L10.06 11.74L5 9.9L10.06 8.06L12 3Z"/>
        <path d="M3 12L4.94 17.06L10 18.9L4.94 20.74L3 25.8L1.06 20.74L-4 18.9L1.06 17.06L3 12Z" transform="translate(15 -5) scale(0.5)"/>
    </svg>
);

export const ProgressIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <polyline points="22 11.08 12 21.08 7.5 16.58"></polyline>
        <polyline points="22 4 12 14.08 7.5 9.58"></polyline>
    </svg>
);
