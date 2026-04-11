# Robotime Community Theme

适用于 **Discourse 3.0+** 的社区主题（子主题形式：可与官方基础主题组合使用，例如 `discourse-corporate`）。

---

## 功能概览

- **顶栏**：黑色顶栏、可配置中间导航链接、可选 Logo 图替换默认「ROBOTIME」字标；与 Discourse 原生头部能力并存。
- **顶栏下轮播**：全宽分类/活动卡片轮播（固定于顶栏下方，向下滚动时可收缩为窄条）；数据来自 `hub-config.json` 的 `hero_banners`，可用主题开关关闭。
- **侧栏**：在原生侧栏中增加活动区插槽；多图时自动轮播；标题与「查看全部」链在主题设置中配置，图片数据来自 `hub-config.json` 的 `sidebar_widgets`。
- **话题列表**：卡片式 masonry 布局（桌面多列 / 移动单列）；可选封面列与自定义话题格（浏览/点赞/回复等）；无图话题使用浅色底 + 居中标题占位。
- **列表导航**：样式统一 Categories / Tags / Latest / New / Top / Bookmarks 等；主题脚本可在登录用户下补充书签入口、为 New 显示数量样式等（仍依赖站点 `top menu` 等核心设置）。
- **多语言**：含 `locales/en.yml`、`locales/zh_CN.yml`（随站点语言包与界面语言生效）。
- **独立预览**：仓库根目录 `preview.html` 可在本地用任意静态服务器打开，用于快速看布局（非 Discourse 真环境）。

---

## 安装方式

1. 进入 **管理后台 → 自定义 → 主题**。
2. **从 Git 仓库安装**（推荐）或上传主题包。
3. 若作为子主题：先启用/安装基础主题，再安装本主题并设为子主题后启用。
4. 在 **主题 → 配色方案** 中可选用自带的 **Robotime** 配色（见 `about.json`）。

---

## 后台配置（Theme settings）

路径：**管理后台 → 自定义 → 主题 → [Robotime Community Theme] → 主题设置**

| 设置项 | 说明 |
|--------|------|
| `robotime_logo_url` | 顶栏 Logo 图片 URL；留空则显示默认 ROBOTIME 文字。 |
| `robotime_nav_links` | 顶栏导航：`标签\|URL`，多条用英文逗号分隔（唯一权威来源，不读 `hub-config.json` 的导航字段）。 |
| `robotime_carousel_enabled` | 是否显示顶栏下轮播；关闭后忽略 `hub-config.json` 中的 `hero_banners`。 |
| `robotime_sidebar_section_title` | 侧栏活动区标题（有 `sidebar_widgets` 时显示）。 |
| `robotime_sidebar_view_all_label` | 「查看全部」文案。 |
| `robotime_sidebar_view_all_url` | 「查看全部」链接；**留空则不显示该链接**。 |
| `robotime_filter_quick_tags` | 话题列表第二行快捷标签：JSON 数组字符串，例如 `[{"label":"Diy","url":"/tag/diy"}]`。 |
| `robotime_official_events_category` | 预留字段，当前不参与逻辑，仅作文案/运营备注。 |
| `robotime_topic_thumbnails_enabled` | 是否启用话题列表封面列与相关列改造（见下节「推荐组件」）。 |
| `robotime_topic_meta_enabled` | 是否在话题格内展示浏览/点赞/回复等元信息（依赖上一项开启时的列布局）。 |

---

## `hub-config.json`（轮播与侧栏图卡）

主题会在页面加载时请求：**`GET /hub-config.json`**（与站点同源）。

| 字段 | 说明 |
|------|------|
| `hero_banners` | 可选。数组，项含 `title`、`image_url`、`link_url`，可选 `bg_color`。用于顶栏下轮播卡片。 |
| `sidebar_widgets` | 可选。数组，项含 `title`、`image_url`、`link_url`。用于侧栏活动小卡/轮播。 |

若请求失败或未返回上述字段，页面仍正常；仅轮播与侧栏图卡为空（导航、标签等仍完全由 **主题设置** 控制）。

**实现方式任选其一**：自研 Discourse 插件注册该路由、反向代理静态 JSON、或 CDN/同域静态文件——只要最终浏览器能访问到 **`/hub-config.json`** 且返回合法 JSON。

**图片地址**：请使用浏览器可直接访问的 URL（Discourse 上传地址需按站点规则使用完整路径；`upload://` 短格式需由插件或后端转换为可访问 URL）。

---

## 推荐与依赖说明

| 类型 | 说明 |
|------|------|
| **Discourse** | 版本不低于 `about.json` 中 `minimum_discourse_version`（当前为 3.0.0）。 |
| **话题缩略图** | 若要在列表中稳定显示话题封面图，建议使用社区成熟的 **Topic Thumbnails** 类主题组件/插件，并为分类等开启缩略图；本主题通过 `robotime_topic_thumbnails_enabled` 控制是否插入封面列与自定义话题单元格。 |
| **列表 Tab（Latest / New / Bookmarks 等）** | 由 Discourse **站点设置**（如 `top menu`）控制出现哪些链接；本主题主要做样式与少量增强脚本。 |
| **`/hub-config.json`** | 非 Discourse 核心自带；需要轮播或侧栏图卡数据时，由你们用插件或运维提供。 |

本仓库 **不强制** 安装某一指定插件；按上表按需组合即可。

---

## 仓库结构（简要）

- `about.json`：主题元数据与配色、静态资源注册。  
- `settings.yml`：主题设置定义（与后台表单一一对应）。  
- `common/`、`desktop/`、`mobile/`：样式与少量 HTML 占位。  
- `javascripts/`：连接器模板、Glimmer 组件、`api-initializers`（含 `robotime-hub.js` 等）。  
- `locales/`：翻译文件。  
- `Icon/`：侧栏与话题统计等 PNG 图标。  
- `preview.html`：本地静态预览页。

---

## 许可与仓库信息

版权与许可以 `about.json` 中的 `license_url` 及仓库托管平台说明为准。
