module.exports = {
  toNodeHandler: (_auth) => (_req, _res, next) => {
    if (typeof next === 'function') next();
  },
  fromNodeHeaders: (headers) => {
    const h = new Headers();
    for (const [k, v] of Object.entries(headers || {})) {
      if (v) h.set(k, Array.isArray(v) ? v.join(', ') : String(v));
    }
    return h;
  }
};
