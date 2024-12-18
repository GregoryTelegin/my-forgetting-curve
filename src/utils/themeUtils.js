export const getCSSVariable = (variable, fallback = '') => {
    const value = getComputedStyle(document.body).getPropertyValue(variable).trim();
    return value || fallback;
};
