const PursuitLogo = ({ className = "", width = "160", height = "50" }) => {
  return (
    <svg 
      viewBox="0 0 600 180" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
      style={{ display: 'block' }}
    >
      {/* Circular arrow design */}
      <g transform="translate(10, 10)">
        {/* Bottom half circle */}
        <path 
          d="M 80 60 A 50 50 0 0 0 30 60" 
          stroke="currentColor" 
          strokeWidth="12" 
          fill="none"
          strokeLinecap="round"
        />
        {/* Top half circle */}
        <path 
          d="M 30 60 A 50 50 0 0 0 80 60" 
          stroke="currentColor" 
          strokeWidth="12" 
          fill="none"
          strokeLinecap="round"
        />
        {/* Arrow pointing up-right */}
        <g transform="translate(75, 15)">
          <line x1="0" y1="25" x2="20" y2="5" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
          <line x1="20" y1="5" x2="5" y2="5" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
          <line x1="20" y1="5" x2="20" y2="20" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
        </g>
      </g>
      
      {/* PURSUIT text */}
      <g transform="translate(120, 0)">
        <text 
          x="0" 
          y="90" 
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif" 
          fontSize="85" 
          fontWeight="700" 
          fill="currentColor"
          letterSpacing="2"
        >
          PURSUIT
        </text>
      </g>
    </svg>
  );
};

export default PursuitLogo;
