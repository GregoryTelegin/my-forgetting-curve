export const getCSSVariable = (variable: string, fallback: string = ''): string => {
  const value = getComputedStyle(document.body).getPropertyValue(variable).trim();
  return value || fallback;
};