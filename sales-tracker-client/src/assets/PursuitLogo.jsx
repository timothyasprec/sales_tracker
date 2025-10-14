const PursuitLogo = ({ className = "", width = "180", height = "60" }) => {
  return (
    <svg 
      viewBox="0 0 1317 458" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
    >
      <path 
        d="M278.5 198.5C278.5 307.5 189.5 396.5 80.5 396.5C80.5 287.5 169.5 198.5 278.5 198.5Z" 
        fill="currentColor"
      />
      <path 
        d="M80.5 198.5C80.5 89.5 169.5 0.5 278.5 0.5C278.5 109.5 189.5 198.5 80.5 198.5Z" 
        fill="currentColor"
      />
      <path 
        d="M278.5 198.5L350.5 126.5" 
        stroke="currentColor" 
        strokeWidth="45" 
        strokeLinecap="round"
      />
      <path 
        d="M278.5 0.5L350.5 72.5" 
        stroke="currentColor" 
        strokeWidth="45" 
        strokeLinecap="round"
      />
      <text 
        x="400" 
        y="310" 
        fontFamily="Arial, sans-serif" 
        fontSize="280" 
        fontWeight="700" 
        fill="currentColor"
      >
        PURSUIT
      </text>
    </svg>
  );
};

export default PursuitLogo;

