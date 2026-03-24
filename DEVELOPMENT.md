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
| 设计稿 | `design-rule/` 目录下 4 张标注图；`针对顶部板块导航栏参考样式.html` 为 Principle 导出的 WebGL 交互原型 |

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
│   ├── header.html             # Handlebars 模板：自定义顶部导航栏
│   ├── after_header.html       # Handlebars 模板：分类卡片轮播区
│   └── head_tag.html           # JavaScript：轮播逻辑、移动端菜单、图片比例检测
├── desktop/
│   └── desktop.scss            # 桌面端 ≥1200px + 平板 768–1199px 布局
├── mobile/
│   └── mobile.scss             # 移动端 <768px 响应式（汉堡菜单、单列卡片）
├── preview.html                # 独立预览页（无需 Discourse 实例，直接浏览器打开）
├── Icon/                       # PNG 图标素材
│   ├── 其他/                   # 资源 33（通知铃铛）、34（礼物）、35（搜索/更多）
│   ├── 左侧图标/
│   │   ├── 白色/               # 资源 22–25（侧栏激活态白色图标）
│   │   └── 黑色/               # 资源 26–29（侧栏未激活黑色图标）
│   └── 点赞评论观看/           # 资源 30（观看）、31（评论）、32（点赞）
├── design-rule/                # 设计标注图
│   ├── 主页.jpg
│   ├── 主题页面总览.jpg
│   ├── 导航栏.jpg
│   └── 导航栏动效.jpg
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
| 模板 | Handlebars (`.html` 内 `<script type="text/x-handlebars">`) | Discourse 标准主题模板机制 |
| 样式 | SCSS (Sass) | Discourse 自动编译，无需本地构建 |
| 脚本 | JavaScript (`<script type="text/discourse-plugin">`) | 使用 Discourse Plugin API |
| 配置 | `about.json` + `settings.yml` + `locales/*.yml` | Discourse 标准主题配置格式 |
| 预览 | 纯 HTML/CSS/JS（`preview.html`） | 独立于 Discourse，用于开发阶段快速查看效果 |

### 3.2 SCSS 变量一览

所有变量定义在 `common/common.scss` 顶部：

| 变量 | 值 | 用途 |
|------|----|------|
| `$robotime-black` | `#000000` | 主文字色、Header 背景、侧栏激活项背景 |
| `$robotime-white` | `#ffffff` | 背景色、Header 文字 |
| `$robotime-blue` | `#66cbff` | 品牌蓝（Official Events、New Topic 按钮） |
| `$robotime-orange` | `#ffb93e` | 品牌橙（Spin & WIN 卡片） |
| `$robotime-gray` | `#777777` | 次级文字 |
| `$robotime-light-gray` | `#f7f7f7` | 浅灰背景 |
| `$robotime-border-gray` | `#dddddd` | 边框、占位符 |
| `$robotime-warm-bg` | `#f6ebe3` | 暖色卡片背景 |
| `$robotime-warm-light` | `#fef7e7` | 浅暖色 |
| `$robotime-warm-peach` | `#ffdcb4` | 桃色 |
| `$robotime-hover-white` | `#cccccc` | 导航悬停色 |
| `$robotime-header-user-bg` | `rgba(255,255,255,0.1)` | 用户区半透明背景 |

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

- **文件**: `common/header.html`, `common/common.scss` (`.robotime-header` 区块)
- **背景**: `#000000`，Logo 为蓝色圆角按钮 (`#66cbff`)
- **菜单**: Help / Community Perks / Win Prize / How To / About / Buy
- **Hover 动效**: 白色下划线从左向右展开 `width 0.3s ease`，文字色变为 `#cccccc`
- **右侧图标**: 使用 `Icon/其他/资源 33-9.png`（铃铛）和 `资源 34-9.png`（礼物），通过 `filter: brightness(0) invert(1)` 反色为白
- **移动端**: 导航隐藏，显示汉堡菜单，点击展开全屏黑色导航覆盖层

### 4.2 分类卡片轮播（Carousel）

- **文件**: `common/after_header.html`, `common/head_tag.html`, `common/common.scss` (`.robotime-carousel` 区块)
- **卡片数据**: 在 `head_tag.html` 中的 `CAROUSEL_CARDS` 数组定义，包含名称、背景色、图标、装饰色、旋转标志、链接
- **动效**:
  - 轨道滑动: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` 0.5s
  - 卡片 Hover: `cubic-bezier(0.34, 1.56, 0.64, 1)` 0.35s（弹性回弹）
  - 旋转卡片 (1/2/5/8): `scale(1.12) rotate(5deg)` + 阴影
  - 非旋转卡片: `scale(1.12)` + 阴影
- **箭头**: 圆形按钮，hover 时略微放大

### 4.3 左侧边栏（Sidebar）

- **文件**: `common/common.scss` (`.robotime-sidebar` 区块)
- **图标素材**:
  - 激活态（白色）: `Icon/左侧图标/白色/资源 22-25`
  - 未激活态（黑色）: `Icon/左侧图标/黑色/资源 26-29`
  - 通过 `filter: brightness(0) invert(1)` 切换
- **Official Events 区块**: 蓝色圆角标题 + 活动卡片 + "View All Events" 链接 + "New topic" 按钮

### 4.4 主内容区

- **筛选栏**: Categories / Tags / Latest (默认选中) / New (34) / Top / Bookmarks
  - 选中态: 黑色文字 + 底部下划线，动画 `width 0.3s ease`
- **话题卡片**: 网格布局，桌面端 2 列，平板 2 列，移动端 1 列
  - 卡片圆角 `20px`，hover 上浮 `translateY(-3px)` + 阴影加深
  - 封面图比例规则: 宽高比 > 0.85 → 1:1 裁剪，< 0.85 → 3:4 裁剪
  - 统计图标使用 `Icon/点赞评论观看/` 下的 PNG 素材

### 4.5 响应式断点

| 断点 | 布局 |
|------|------|
| ≥ 1200px | 桌面端：完整侧栏 270px + 2 列话题卡片 |
| 768–1199px | 平板：窄侧栏 220px + 2 列卡片，导航栏字号缩小 |
| < 768px | 移动端：隐藏侧栏和导航，汉堡菜单，单列卡片 |

---

## 五、图标素材对照表

| 文件名 | 位置 | 内容 | 使用位置 |
|--------|------|------|----------|
| `资源 22-9.png` | `Icon/左侧图标/白色/` | Topics 图标 (白) | 侧栏激活态 |
| `资源 23-9.png` | `Icon/左侧图标/白色/` | My posts 图标 (白) | 侧栏激活态 |
| `资源 24-9.png` | `Icon/左侧图标/白色/` | My messages 图标 (白) | 侧栏激活态 |
| `资源 25-9.png` | `Icon/左侧图标/白色/` | Invite Friends 图标 (白) | 侧栏激活态 |
| `资源 26-9.png` | `Icon/左侧图标/黑色/` | Topics 图标 (黑) | 侧栏未激活态 |
| `资源 27-9.png` | `Icon/左侧图标/黑色/` | My posts 图标 (黑) | 侧栏未激活态 |
| `资源 28-9.png` | `Icon/左侧图标/黑色/` | My messages 图标 (黑) | 侧栏未激活态 |
| `资源 29-9.png` | `Icon/左侧图标/黑色/` | Invite Friends 图标 (黑) | 侧栏未激活态 |
| `资源 30-9.png` | `Icon/点赞评论观看/` | 浏览/观看图标 | 话题卡片统计 |
| `资源 31-9.png` | `Icon/点赞评论观看/` | 评论图标 | 话题卡片统计 |
| `资源 32-9.png` | `Icon/点赞评论观看/` | 点赞图标 | 话题卡片统计 |
| `资源 33-9.png` | `Icon/其他/` | 通知铃铛 | Header 右侧 |
| `资源 34-9.png` | `Icon/其他/` | 礼物盒 | Header 右侧 |
| `资源 35-9.png` | `Icon/其他/` | 搜索/更多 | 侧栏 More |

---

## 六、设置项说明 (`settings.yml`)

| 设置名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `robotime_logo_url` | string | 空 | Header Logo 图片 URL |
| `robotime_nav_links` | string | `Help\|/help,...` | 导航链接，格式 `标签\|URL` 逗号分隔 |
| `robotime_carousel_enabled` | bool | `true` | 启用/禁用分类轮播 |
| `robotime_official_events_category` | string | 空 | Official Events 对应的分类 slug |

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
| 分类轮播 | ✅ | 11 张卡片、左右箭头、弹性 hover 缩放/旋转动效 |
| 左侧边栏 | ✅ | 菜单项 + PNG 图标、Official Events 区块 |
| 筛选标签栏 | ✅ | 6 个标签切换 + 下划线动画 |
| 话题卡片网格 | ✅ | 2 列网格、圆角卡片、1:1/3:4 比例裁剪、PNG 统计图标 |
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
2. **轮播卡片插画**: 当前使用 emoji 占位符，后续需替换为设计师提供的实际 PNG/SVG 插画。
3. **Principle 原型**: `针对顶部板块导航栏参考样式.html` 是 WebGL 应用，在无 GPU 的环境中无法渲染。
4. **Sidebar 图标映射**: 当前 `preview.html` 中的侧栏使用了 `Icon/左侧图标/黑色/` 下的图标，激活态切换通过 CSS `filter` 实现反色。如果设计师后续提供了新的图标（例如 SVG 格式），需要更新对应路径。

---

## 十、关键 CSS 动画参数速查

| 动画 | CSS | 参数 |
|------|-----|------|
| 导航 hover 下划线 | `width` | `0 → 100%`，`0.3s ease` |
| 轮播轨道滑动 | `transform: translateX` | `0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| 卡片 hover (旋转) | `transform: scale(1.12) rotate(5deg)` | `0.35s cubic-bezier(0.34, 1.56, 0.64, 1)` |
| 卡片 hover (仅缩放) | `transform: scale(1.12)` | 同上 |
| 卡片 hover 阴影 | `box-shadow` | `0 8px 24px rgba(0,0,0,0.15)`，`0.3s ease` |
| 话题卡片 hover | `transform: translateY(-3px)` | `0.25s ease` |
| 箭头 hover | `scale(1.05)` | `0.2s ease` |
| 筛选标签下划线 | `width` | `0 → 100%`，`0.3s ease` |
