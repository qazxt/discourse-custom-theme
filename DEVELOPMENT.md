# Robotime Community Theme — 开发归档文档

> 本文档面向后续接手的开发者，记录项目当前状态、技术架构、文件说明、已完成/待完成事项以及部署方式。

---

## 一、项目概述

| 项 | 值 |
|---|---|
| 项目名称 | Robotime Community Theme |
| 目标平台 | Discourse v3.x+ |
| 仓库地址 | https://github.com/qazxt/discourse-custom-theme |
| 主题类型 | 完整主题（非组件），子主题架构，依赖官方基础主题（如 `discourse-corporate`） |
| 设计稿 | `design-rule/` 下 **homepage / theme-overview / navbar / navbar-animation / navbar-bg-colors** 等 JPG + `DESIGN-SPEC.md`（资源索引与设计/代码差异见该文档 **§零、§十一**）；`针对顶部板块导航栏参考样式.html` 为 Principle 导出的 WebGL 交互原型 |

---

## 二、目录结构与文件说明

```
.
├── about.json                  # 主题元数据 + Robotime 配色方案
├── settings.yml                # 可配置项（Logo URL、导航链接、轮播开关、活动分类）
├── locales/
│   └── en.yml                  # 英文翻译字符串
├── common/
│   ├── common.scss             # 通用 SCSS（变量、Header、轮播、侧栏、话题卡片、筛选栏）
│   ├── header.html             # 占位（顶栏见 javascripts/robotime/connectors/above-site-header/）
│   ├── after_header.html       # 占位（轮播见 javascripts/robotime/connectors/below-site-header/）
│   └── head_tag.html           # 占位（逻辑见 javascripts/discourse/api-initializers/robotime-hub.js）
├── javascripts/
│   ├── discourse/
│   │   └── api-initializers/
│   │       └── robotime-hub.js   # hub-config、轮播、侧栏小部件、quick tags
│   └── robotime/
│       └── connectors/
│           ├── above-site-header/
│           │   └── robotime-header.hbs
│           └── below-site-header/
│               └── robotime-carousel.hbs
├── desktop/
│   └── desktop.scss            # 桌面端 ≥1200px + 平板 768–1199px 布局
├── mobile/
│   └── mobile.scss             # 移动端 <768px 响应式（汉堡菜单、单列卡片）
├── preview.html                # 独立预览页（无需 Discourse 实例，直接浏览器打开）
├── Icon/                       # PNG 图标素材（全英文命名）
│   ├── carousel/               # 轮播卡片素材 ({序号}-in.png=内部插画, {序号}-back.png=背景)
│   │   ├── 1-in.png, 1-back.png   (User Guide & Perks)
│   │   ├── 3-in.png               (Ongoing Events)
│   │   ├── 4-in.png               (Say Hi To Everyone)
│   │   ├── 5-in.png, 5-back.png   (Spin & WIN)
│   │   ├── 6-in.png ~ 11-in.png   (Showcase ~ Instruction Manual)
│   │   └── 注: 2-in.png 暂缺 (Crafting Tips & Ideas)
│   ├── sidebar/
│   │   ├── white/              # 侧栏激活态白色图标 (topics, my-posts, my-messages, invite-friends)
│   │   └── black/              # 侧栏未激活黑色图标 (同上)
│   ├── topic-stats/            # 话题统计图标 (views, comments, likes)
│   └── misc/                   # 杂项 (notification, gift, more)
├── design-rule/                # 设计标注图 + 结构化规范
│   ├── homepage.jpg            # 主页整体标注
│   ├── theme-overview.jpg      # 主题总览 / 模块关系
│   ├── navbar.jpg              # 顶栏 + 轮播尺寸与卡片规格
│   ├── navbar-animation.jpg    # hover / 动效参数
│   ├── navbar-bg-colors.jpg    # 卡片背景色迭代稿（与 §数据表 可能不一致，见 DESIGN-SPEC.md）
│   └── DESIGN-SPEC.md          # 导航/轮播/筛选/侧栏规范 + **设计资源索引 §零** + **稿码差异 §十一**
├── 针对顶部板块导航栏参考样式.html  # Principle 导出的 WebGL 交互原型（需 GPU 加速）
├── README.md                   # 原始产品需求文档
├── AGENTS.md                   # AI 开发环境说明
└── DEVELOPMENT.md              # 本文件
```

---

## 三、技术架构

### 3.1 技术栈

| 层面 | 技术 | 说明 |
|------|------|------|
| 模板 | `.hbs` 连接器（`javascripts/<命名空间>/connectors/<outlet>/<name>.hbs`） | 与官方「Multiple JS files」示例一致；**不要**放在 `javascripts/discourse/connectors/`（那是插件式路径，主题里易不生效） |
| 样式 | SCSS (Sass) | Discourse 自动编译，无需本地构建 |
| 脚本 | `api-initializers`（`javascripts/discourse/api-initializers/*.js`） | 使用 `apiInitializer` + Plugin API |
| 配置 | `about.json` + `settings.yml` + `locales/*.yml` | Discourse 标准主题配置格式 |
| 预览 | 纯 HTML/CSS/JS（`preview.html`） | 独立于 Discourse，用于开发阶段快速查看效果 |

### 3.2 SCSS 变量一览

主要颜色变量定义在 `common/common.scss` 顶部：

| 变量 | 值 | 用途 |
|------|----|------|
| `$robotime-black` | `#000000` | 主文字色、Header 背景、侧栏激活项背景 |
| `$robotime-white` | `#ffffff` | 背景色、Header 文字 |
| `$robotime-blue` | `#66cbff` | 品牌蓝（Official Events、New Topic 按钮） |
| `$robotime-orange` | `#ffb93e` | 品牌橙（Spin & WIN 卡片） |
| `$robotime-gray` | `#777777` | 次级文字 |
| `$robotime-light-gray` | `#f7f7f7` | 浅灰背景 |
| `$robotime-border-gray` | `#dddddd` | 边框、占位符 |
| `$robotime-hover-white` | `#cccccc` | 导航悬停色 |
| `$robotime-header-user-bg` | `rgba(255,255,255,0.1)` | 用户区半透明背景 |
| `$robotime-sidebar-canvas` | `#f5f5f5` | 页面画布背景（与 preview 一致） |

> 历史文档中的 `$robotime-warm-*` 若仍出现在旧段落，以 **`hub-config.json` 的 `bg_color`** 与 **`DESIGN-SPEC.md` §二** 为准；不必在 SCSS 中单独维护每张卡片色变量。

### 3.2b 运行时 CSS 变量（`html` / `robotime-hub.js`）

用于 **固定顶栏 + 轮播** 占位与侧栏 sticky，与 `preview.html` 的 spacer 逻辑等价：

| 变量 | 谁写入 | 用途 |
|------|--------|------|
| `--robotime-header-offset` | `robotime-hub.js` → `updateRobotimeHeaderOffset()` | 顶栏 + 轮播 **实测总高度**；用于 `#main-outlet-wrapper` 的 `padding-top`、侧栏 `top` |
| `--robotime-topbar-height` | `common.scss`（`60px`）+ `mobile.scss`（`52px`） | 固定轮播条的 `top`，与移动菜单遮罩 `top` 对齐 |
| `--robotime-hub-transition` | `common.scss` | 轮播展开/收缩时 padding、背景、卡片尺寸的过渡时长（默认 `0.35s ease-in-out`） |

首屏在 JS 跑完前，`html` 上仍有 **大约 `220px`** 的 `--robotime-header-offset` 兜底（见 `common.scss`），减轻内容闪到顶栏下的问题。

### 3.3 配色方案 (`about.json`)

```
primary:          #000000    header_background: #000000
secondary:        #ffffff    header_primary:    #ffffff
tertiary (蓝):    #66cbff    highlight:         #fef7e7
quaternary (橙):  #ffb93e    danger:            #e45735
                             success:           #4EB279
                             love:              #FA6C8D
```

---

## 四、各模块实现详情

### 4.1 顶部导航栏（Header）

- **模板**: `javascripts/robotime/connectors/above-site-header/robotime-header.hbs`（`common/header.html` 仅为占位说明）
- **样式**: `common/common.scss`（`.robotime-above-header`、`.robotime-header`）、`mobile/mobile.scss`（52px 顶栏高度）
- **定位**: `.robotime-above-header` 为 **`position: fixed`**，贴视口顶；z-index **1200**，高于分类轮播
- **原生顶栏**: `.d-header-wrap` 由 CSS 隐藏；`robotime-hub.js` 将 **`.d-header` 内搜索/用户区** 移到 `.robotime-header__user`，避免功能丢失
- **背景**: `#000000`，Logo 为蓝色圆角按钮 (`#66cbff`) 或由 `robotime_logo_url` 换图
- **菜单**: 文案与 URL 来自 **`settings.yml` → `robotime_nav_links`**（非 hub-config）；默认多帮助链，可按运营改
- **Hover 动效**: 白色下划线从左向右展开 `width 0.3s ease`，文字色变为 `#cccccc`
- **右侧图标**: 以 Discourse 原生图标为主；静态素材见 `Icon/misc/`（`notification.png`、`gift.png`）
- **移动端**: 主导航隐藏，汉堡按钮打开 **全屏遮罩** `.robotime-mobile-nav`（`position: fixed`，`top: var(--robotime-topbar-height)`，`z-index: 1220`）

### 4.2 分类卡片轮播（Carousel）

- **模板**: `javascripts/robotime/connectors/below-site-header/robotime-carousel.hbs`
- **脚本 + 数据**: `javascripts/discourse/api-initializers/robotime-hub.js`；**`hero_banners[]` 仅来自 `/hub-config.json`**；**`robotime_carousel_enabled`** 为 false 时整块不展示并影响高度占位
- **定位**: `#robotime-carousel` **`position: fixed`**，`top: var(--robotime-topbar-height)`，`z-index: 1190`（在顶栏下方、主内容之上）；**与顶栏一起在滚动时保持可见**
- **主内容占位**: `#main-outlet-wrapper { padding-top: var(--robotime-header-offset) }`，高度由 JS **测量**顶栏+轮播后写入 `html`（`ResizeObserver` + 折叠后延迟再测）
- **滚动收缩**: 页面可滚动且 `scrollY` 大于约 **100px** 时根节点添加 **`robotime-carousel--collapsed`**；小于约 **28px** 时移除（短页 / 无足够滚高则不收，避免闪动）— 逻辑与 `preview.html` 的 `layer-b.collapsed` 对齐
- **收缩视觉**: 区背景改 **黑**；卡片缩小、**图片与渐变遮罩隐藏**；保留 `bg_color` 文字条；轨道 `gap` 缩小；箭头改为半透明浅色（详见 `common.scss`）
- **展开态动效**:
  - 轨道滑动: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` 0.5s
  - 卡片 Hover: `cubic-bezier(0.34, 1.56, 0.64, 1)` 0.35s（弹性回弹）
  - 旋转卡片 (1/2/5/8): `scale(1.12) rotate(5deg)` + 阴影
  - 非旋转卡片: `scale(1.12)` + 阴影
- **配置分工摘要**: 导航、预显标签、侧栏标题等 **一律主题设置**；JSON **仅** `hero_banners` / `sidebar_widgets` — 全文见 **`PLUGIN-INTERFACE.md`**

### 4.3 左侧边栏（Sidebar）

- **文件**: `common/common.scss` (`.robotime-sidebar-widget`、侧栏菜单覆盖等)；widget 槽位见 `javascripts/discourse/connectors/after-sidebar-sections/robotime-sidebar-slot.hbs`
- **图标素材**:
  - 激活态（白色）: `Icon/sidebar/white/*.png`
  - 未激活态（黑色）: `Icon/sidebar/black/*.png`
  - 通过 `filter: brightness(0) invert(1)` 等方式切换（以 SCSS 为准）
- **侧栏底部活动轮播区**:
  - **顶部标题 / 查看全部 文案与 URL**: **主题设置** `robotime_sidebar_*`（权威）
  - **轮播幻灯片**: `sidebar_widgets[]` 来自 **`/hub-config.json`**
  - 无 `url` 时不显示「查看全部」链接
  - 主题侧样式: 标题为品牌蓝 `#66cbff` 圆角条白字；底部为描边圆角按钮式链接
- **Discourse 原生**: 侧栏内 "New topic" 等仍由 Discourse 提供（非本主题 mock）

### 4.4 主内容区

- **筛选栏**（列表页 `.list-controls`，对接 Discourse 原生导航）:
  - **第一行**: Categories、Tags 为原生下拉；主题样式为 **#777 圆角描边**（`select-kit-header`）；右侧 **Latest**（默认选中）/ **New** / **Top** / **Bookmarks** 为 Tab，**24px**（桌面）、灰字选中黑字 + 下划线；下拉与 Tab 间距见 `common/common.scss`。
  - **第二行预显标签**: **仅** 主题设置 **`robotime_filter_quick_tags`**（JSON 数组字符串）；**不从** `hub-config.json` 读取；**16px**、`#777`，选中/悬停黑字 + 下划线；显示时自动为 `label` 加 `#` 前缀（若未写）。
- **筛选栏（预览）**: `preview.html` 内用 `.filter-dd` 模拟下拉框，结构与稿一致。
- **话题列表 Tab 动效**: 黑色文字 + 底部下划线（与 `common/common.scss` 中 `.nav-pills` 一致）
- **话题卡片**: 网格布局 — **≥1200px：3 列**；**768–1199px：2 列**；**&lt;768px：1 列**（与 `preview.html` 三列宽屏一致）
  - 卡片圆角 `20px`，hover 上浮 `translateY(-3px)` + 阴影加深
  - 封面图比例规则: 宽高比 > 0.85 → 1:1 裁剪，< 0.85 → 3:4 裁剪
  - 统计图标使用 `Icon/点赞评论观看/` 下的 PNG 素材

### 4.5 响应式断点

| 断点 | 布局 |
|------|------|
| ≥ 1200px | 桌面端：完整侧栏 **270px** + **3 列**话题卡片 |
| 768–1199px | 平板：窄侧栏 **220px** + **2 列**卡片，顶栏导航字号缩小 |
| < 768px | 移动端：隐藏侧栏列、顶栏主导航；**汉堡菜单**；**1 列**卡片 |

---

## 五、图标素材对照表

### 轮播卡片素材 (`Icon/carousel/`)

| 文件名 | 对应卡片 | 类型 |
|--------|----------|------|
| `1-in.png` | User Guide & Perks | 内部插画 (书本指南) |
| `1-back.png` | User Guide & Perks | 背景底纹 |
| `3-in.png` | Ongoing Events | 内部插画 (彩旗庆祝) |
| `4-in.png` | Say Hi To Everyone | 内部插画 (HELLO 文字) |
| `5-in.png` | Spin & WIN | 内部插画 (转盘) |
| `5-back.png` | Spin & WIN | 背景底纹 |
| `6-in.png` | Showcase & Story | 内部插画 (奖杯+放大镜) |
| `7-in.png` | DIY & Crafting Club | 内部插画 (剪刀/工具) |
| `8-in.png` | Nanci's Dairy | 内部插画 (兔子角色) |
| `9-in.png` | New Arrivals | 内部插画 (NEW 徽章) |
| `10-in.png` | Exclusive Deals | 内部插画 (SALE 标签) |
| `11-in.png` | Instruction Manual | 内部插画 (剪贴板文档) |

> 注: `2-in.png` (Crafting Tips & Ideas) 暂缺，当前使用 💡 emoji 占位。

### 侧栏图标 (`Icon/sidebar/`)

| 文件名 | 内容 | 使用位置 |
|--------|------|----------|
| `white/topics.png` | Topics 图标 (白) | 侧栏激活态 |
| `white/my-posts.png` | My posts 图标 (白) | 侧栏激活态 |
| `white/my-messages.png` | My messages 图标 (白) | 侧栏激活态 |
| `white/invite-friends.png` | Invite Friends 图标 (白) | 侧栏激活态 |
| `black/topics.png` | Topics 图标 (黑) | 侧栏未激活态 |
| `black/my-posts.png` | My posts 图标 (黑) | 侧栏未激活态 |
| `black/my-messages.png` | My messages 图标 (黑) | 侧栏未激活态 |
| `black/invite-friends.png` | Invite Friends 图标 (黑) | 侧栏未激活态 |

### 话题统计图标 (`Icon/topic-stats/`)

| 文件名 | 内容 |
|--------|------|
| `views.png` | 浏览/观看图标 |
| `comments.png` | 评论图标 |
| `likes.png` | 点赞图标 |

### 杂项图标 (`Icon/misc/`)

| 文件名 | 内容 | 使用位置 |
|--------|------|----------|
| `notification.png` | 通知铃铛 | Header 右侧 |
| `gift.png` | 礼物盒 | Header 右侧 |
| `more.png` | 搜索/更多 | 侧栏 More |

---

## 六、设置项说明 (`settings.yml`)

| 设置名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `robotime_logo_url` | string | 空 | Header Logo 图片 URL |
| `robotime_nav_links` | string | `Help\|/help,...` | 导航链接，格式 `标签\|URL` 逗号分隔 |
| `robotime_carousel_enabled` | bool | `true` | 启用/禁用分类轮播 |
| `robotime_official_events_category` | string | 空 | Official Events 对应的分类 slug |
| `robotime_sidebar_section_title` | string | `Official Events` | 侧栏活动区标题（有 `sidebar_widgets` 时显示） |
| `robotime_sidebar_view_all_label` | string | `View All Events` | 侧栏「查看全部」文案 |
| `robotime_sidebar_view_all_url` | string | 空 | 侧栏「查看全部」URL；空则不显示链接 |
| `robotime_filter_quick_tags` | string | 空 | 预显标签 JSON 数组字符串（主题权威，不从 hub-config 读） |

---

## 七、本地开发指南

### 7.1 预览（无需 Discourse）

```bash
# 启动静态文件服务
python3 -m http.server 8080

# 浏览器打开
open http://localhost:8080/preview.html
```

`preview.html` 是独立的 HTML 文件，包含完整的样式和交互逻辑，所有组件直接内嵌。修改 `preview.html` 后刷新浏览器即可查看效果。

### 7.2 SCSS 验证

```bash
# 安装 Dart Sass（如未安装）
npm install -g sass

# 编译验证
sass common/common.scss /tmp/common_test.css
sass desktop/desktop.scss /tmp/desktop_test.css
sass mobile/mobile.scss /tmp/mobile_test.css
```

### 7.3 部署到 Discourse 实例

1. 进入 Discourse 管理后台：`Admin > Customize > Themes`
2. 点击 `Install > From a git repository`
3. 输入仓库地址：`https://github.com/qazxt/discourse-custom-theme`
4. 选择分支（当前开发分支：`cursor/development-environment-setup-7f38`，正式上线时合并到 `main`）
5. 安装后设为默认主题或子主题
6. 在主题设置中配置 `robotime_logo_url` 等参数

---

## 八、已完成 / 待完成

### ✅ 已完成

| 模块 | 状态 | 说明 |
|------|------|------|
| Header 导航栏 | ✅ | 黑色背景、Logo、6 个导航链接、hover 下划线、图标素材 |
| 分类轮播 | ✅ | `hub-config` 驱动卡片、固定顶栏下展示、滚动收缩、左右箭头、弹性 hover 缩放/旋转 |
| 左侧边栏 | ✅ | 菜单项 + PNG 图标、Official Events 区块 |
| 筛选标签栏 | ✅ | 6 个标签切换 + 下划线动画 |
| 话题卡片网格 | ✅ | 宽屏 **3** 列 / 平板 2 列 / 移动 1 列；圆角卡片、1:1/3:4 比例裁剪、PNG 统计图标 |
| 桌面端样式 | ✅ | ≥1200px 布局 |
| 平板端适配 | ✅ | 768–1199px |
| 移动端响应 | ✅ | <768px、汉堡菜单、单列 |
| 独立预览页 | ✅ | `preview.html` |
| 配色方案 | ✅ | `about.json` 中定义 |
| 设置项 | ✅ | `settings.yml` |
| 国际化 | ✅ | `locales/en.yml` |

### ⏳ 后续可扩展

| 任务 | 优先级 | 说明 |
|------|--------|------|
| 替换 emoji 为实际插画 | 高 | 轮播卡片当前使用 emoji 占位，设计稿中有精美插画，需替换为真实图片 |
| Discourse 实例集成测试 | 高 | 当前仅有 `preview.html` 静态测试，需在真实 Discourse 上验证主题兼容性 |
| 添加 `zh_CN.yml` | 中 | 补充中文翻译 |
| 主题详情页样式 | 中 | 目前仅覆盖首页/列表页，话题详情页尚未定制 |
| 无限滚动/分页 | 中 | 话题列表的滚动加载逻辑需对接 Discourse API |
| 用户个人中心页 | 低 | 点击头像进入的页面样式 |
| 深色模式 | 低 | 可在 `about.json` 中新增 Dark 配色方案 |
| Google Sans Flex 字体 | 低 | 该字体为 Google 内部字体，需确认授权或替换为 `Noto Sans` |

---

## 九、已知问题

1. **字体**: 设计稿指定 `Google Sans Flex-Regular`，该字体不公开可用。当前 preview 使用 `Noto Sans` 作为替代，Discourse 主题 fallback 到 `Helvetica Neue / Arial`。
2. **轮播卡片插画**: 线上可由 `hub-config.json` 配 `image_url`；无图时可能仍用占位。设计子目录 `Icon/carousel/` 的命名与用途见 **§五** 图标表。
3. **Principle 原型**: `针对顶部板块导航栏参考样式.html` 是 WebGL 应用，在无 GPU 的环境中无法渲染。
4. **设计稿与标注**: `navbar-bg-colors.jpg` 与 `DESIGN-SPEC.md` §二 按卡片语义的上色 **可能不一致**；以运营配置的 `bg_color` + 规范表为准，并建议设计侧统一后更新 JPG。
5. **文档滞后**: 若 Discourse 核心 DOM（如 `#main-outlet-wrapper`）变更导致顶栏留白失效，需在主题内补选择器 — 以实例 DevTools 为准。

---

## 十、关键 CSS 动画参数速查

| 动画 | CSS | 参数 |
|------|-----|------|
| 导航 hover 下划线 | `width` | `0 → 100%`，`0.3s ease` |
| 轮播轨道滑动 | `transform: translateX` | `0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| 轮播展开/收缩 | `padding`、`background-color`、`gap`、卡片宽高 | `var(--robotime-hub-transition)`，见 `common.scss` |
| 卡片 hover (旋转) | `transform: scale(1.12) rotate(5deg)` | `0.35s cubic-bezier(0.34, 1.56, 0.64, 1)` |
| 卡片 hover (仅缩放) | `transform: scale(1.12)` | 同上 |
| 卡片 **收缩态** hover | `transform: scale(1.05)` | 减小幅度以免贴边裁切 |
| 卡片 hover 阴影 | `box-shadow` | `0 8px 24px rgba(0,0,0,0.15)`，`0.3s ease` |
| 话题卡片 hover | `transform: translateY(-3px)` | `0.25s ease` |
| 箭头 hover | `scale(1.05)` / 收缩态主题内另有浅色 hover | `0.2s ease` |
| 筛选标签下划线 | `width` | `0 → 100%`，`0.3s ease` |
