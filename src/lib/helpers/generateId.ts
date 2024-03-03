let incrementingId = 0;

export const generateId = () => {
  incrementingId++;
  return incrementingId;
};
