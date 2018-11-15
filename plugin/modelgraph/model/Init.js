// urlParams is null when used for embedding
window.urlParams = window.urlParams || {};

// Public global variables
window.MAX_REQUEST_SIZE = window.MAX_REQUEST_SIZE  || 10485760;
window.MAX_AREA = window.MAX_AREA || 15000 * 15000;
ROOT_PATH = 'http://127.0.0.1:8008';
// URLs for save and export
// window.EXPORT_URL = window.EXPORT_URL || ROOT_PATH + '/web/modelgraph/export';
// window.SAVE_URL = window.SAVE_URL || ROOT_PATH + '/web/modelgraph/save';
// window.OPEN_URL = window.OPEN_URL || ROOT_PATH + '/web/modelgraph/open';
window.RESOURCES_PATH = window.RESOURCES_PATH || ROOT_PATH + '/plugin/mxGraph/resources';
window.RESOURCE_BASE = window.RESOURCE_BASE || window.RESOURCES_PATH + '/grapheditor';

// 必需，才能找到stencils下的xml
window.STENCIL_PATH = window.STENCIL_PATH || ROOT_PATH + '/plugin/mxGraph/stencils';

// window.IMAGE_PATH = window.IMAGE_PATH || ROOT_PATH + '/plugin/mxGraph/images';
window.STYLE_PATH = window.STYLE_PATH || ROOT_PATH + '/plugin/mxGraph/styles';
// window.CSS_PATH = window.CSS_PATH || ROOT_PATH + '/plugin/mxGraph/styles';
// window.OPEN_FORM = window.OPEN_FORM || ROOT_PATH + '/plugin/mxGraph/open.html';

// Sets the base path, the UI language via URL param and configures the
// supported languages to avoid 404s. The loading of all core language
// resources is disabled as all required resources are in grapheditor.
// properties. Note that in this example the loading of two resource
// files (the special bundle and the default bundle) is disabled to
// save a GET request. This requires that all resources be present in
// each properties file since only one file is loaded.
window.mxBasePath = window.mxBasePath || ROOT_PATH + '/plugin/mxGraph/src';
window.mxLanguage = window.mxLanguage || urlParams['lang'];
window.mxLanguages = window.mxLanguages || ['de','zh-CN'];
mxLanguage = 'zh-CN';  // 中文资源包