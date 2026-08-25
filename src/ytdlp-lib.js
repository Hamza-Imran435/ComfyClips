import YTDlpWrapModule from 'yt-dlp-wrap-plus';

// yt-dlp-wrap-plus's CJS build sometimes double-wraps its default export
// (module.default.default instead of module.default). Unwrap defensively.
const YTDlpWrap =
  typeof YTDlpWrapModule === 'function' ? YTDlpWrapModule : YTDlpWrapModule.default;

export default YTDlpWrap;
