const winston = require('winston');

// Redact sensitive information
const redact = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  const redacted = { ...obj };
  const sensitiveKeys = ['password', 'token', 'jwt', 'secret', 'authorization'];

  for (const key in redacted) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redact(redacted[key]);
    }
  }

  return redacted;
};

const safeLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const redactedMeta = redact(meta);
      return `${timestamp} ${level}: ${message} ${Object.keys(redactedMeta).length ? JSON.stringify(redactedMeta) : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = safeLogger;
