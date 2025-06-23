
export const createStarIcon = (color: string) => {
  console.log(`⭐ [StarIcon] Creating star with color: ${color}`);
  
  const svg = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
            fill="${color}" 
            stroke="white" 
            stroke-width="3"
            opacity="1"/>
    </svg>
  `;
  
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  console.log(`⭐ [StarIcon] Generated star icon data URL for color ${color}`);
  return dataUrl;
};
