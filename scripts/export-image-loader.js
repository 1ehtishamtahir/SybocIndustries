// Custom `next/image` loader for the static export (`npm run build:static`).
// There is no image optimizer on a static host, so the source URL from /public
// is returned unchanged. The server build keeps Next's default optimizer.
module.exports = function exportImageLoader({ src }) {
  return src;
};
