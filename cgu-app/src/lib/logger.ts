const isDev = process.env.NODE_ENV !== "production";

const noop = () => {};

export const logger = {
  log: isDev ? console.log : noop,
  warn: isDev ? console.warn : noop,
  error: console.error,
  info: isDev ? console.info : noop,
};
