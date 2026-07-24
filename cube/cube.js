// Cube configuration options: https://cube.dev/docs/config
/** @type { import('@cubejs-backend/server-core').CreateOptions } */
module.exports = {
  queryRewrite: (query, { securityContext }) => {
    if (!query.limit || query.limit > 5000) {
      query.limit = 5000;
    }
    return query;
  },
};