export const capitalize = (value: string): string => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const shorten = (value: string): string => {
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
};
