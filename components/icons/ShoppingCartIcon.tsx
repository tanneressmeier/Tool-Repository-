import React from 'react';

export const ShoppingCartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.093-.822l.383-1.437c.113-.42-.028-.86-.334-1.172h-.002M7.5 14.25 6.108 5.25A2.25 2.25 0 0 1 8.358 3h7.284a2.25 2.25 0 0 1 2.25 2.25v.03a.75.75 0 0 1-.67 1.418H10.125a.75.75 0 0 1-.75-.75V5.25a.75.75 0 0 0-.75-.75H8.358M7.5 14.25h11.218M15 11.25a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);