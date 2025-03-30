const now = new Date();
export const isFunny =
  (now.getMonth() === 3 && now.getDate() === 1) ||
  import.meta.env.DEBUG_FUNNY === 'true';
