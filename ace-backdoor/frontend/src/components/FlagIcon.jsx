import React from "react";

const FlagIcon = ({ countryCode, className = "w-5 h-5" }) => {
  // 1. Safety check
  if (!countryCode) return null;

  // 2. Normalize the code
  //    - 'UK' is often used for United Kingdom, but the standard ISO code is 'GB'
  let code = countryCode.toUpperCase();
  if (code === "UK") code = "GB";

  // 3. Handle Localhost / Unknown case
  if (code === "??" || code === "UNKNOWN") {
    return (
      <span
        className={`flex items-center justify-center bg-gray-700 text-white text-[10px] font-bold rounded ${className}`}
        title="Localhost / Unknown"
      >
        ?
      </span>
    );
  }

  const flagUrl = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  return (
    <img
      src={flagUrl}
      alt={code}
      className={`${className} object-cover rounded-[2px] shadow-sm`}
      // Fallback: If the code is wrong (e.g. 'XX') and image fails, show text instead
      onError={(e) => {
        e.currentTarget.style.display = "none";
        // We can render a fallback span immediately after
        const fallback = document.createElement("span");
        fallback.className = `flex items-center justify-center bg-indigo-900 text-white text-[9px] font-bold rounded border border-indigo-700 ${className}`;
        fallback.innerText = code;
        e.currentTarget.parentNode.appendChild(fallback);
      }}
    />
  );
};

export default FlagIcon;
