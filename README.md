

# 🎨 Discourse 定制主题需求文档  
> 项目名称：Robotime Community Theme  
> 版本：v1.1（文档对齐代码）  
> 最后更新：2026年4月2日  
> 适用平台：Discourse v3.x+  

**说明**：产品级需求以本文档为准；**实现细节、数据源分工、固定顶栏与滚动收缩** 以 `DEVELOPMENT.md`、`design-rule/DESIGN-SPEC.md`、`PLUGIN-INTERFACE.md` 为补充（避免本文档滞后）。

---

## 📌 一、项目概述

本主题旨在为 Robotime 品牌社区打造一个高度定制化、视觉活泼、交互友好的前端界面。主题将覆盖首页导航栏、分类卡片轮播区、左侧边栏、话题列表页等核心区域，强调品牌色彩、动态反馈与用户体验一致性。

---

## 🧩 二、主要模块与设计规范

### 1️⃣ 顶部导航栏（Header Navigation）

#### ✅ 静态样式
- **背景色**：`#000000`
- **Logo**：左上角 “ROBOTIME” 蓝色椭圆按钮（可点击返回首页）
- **菜单项**：
  - `Help`, `Community Perks`, `Win Prize`, `How To`, `About`, `Buy`
  - 字体：`Google Sans Flex-Regular`, 字号 `24px`, 颜色 `#ffffff`
  - 悬停效果：下划线 + 颜色变浅（建议 `#cccccc`）
- **右侧用户区**：
  - 图标：通知铃铛、礼物盒、用户头像（带用户名如 “Lance.li”）
  - 背景：半透明深灰 `rgba(255,255,255,0.1)`，圆角 `20px`

#### ⚙️ 动态行为
- 所有菜单项支持 hover 下划线动画（CSS：伪元素 `width` `0.3s ease`）
- 用户头像与工具区行为以 Discourse 原生为准（主题将图标区并入自定义顶栏）
- **整 bar 固定**：向下滚动页面时顶栏 **不离开视口**（`position: fixed`，见主题 `common.scss`）

---

### 2️⃣ 分类卡片轮播区（Category Carousel）

#### ✅ 静态布局
- **容器**：紧贴顶栏下方；展开态含内边距与设计留白；**收缩态**高度变小、区背景改深色（与 `preview.html` 一致）
- **卡片尺寸（设计目标）**：
  - 宽度：`245px`
  - 总高约 `140px`（含底部标签区）
  - 圆角：`10px`
  - 间距：轨道 **展开** 约 `45px`（实现值以 SCSS 为准）
- **字体**：
  - 标题：`Google Sans Flex-Regular`, `24px`（线上多 fallback 至 Noto Sans）
  - 标签颜色按底色对比度分 **深底白字 / 浅底黑字**（见 `DESIGN-SPEC.md` §二）
- **数据**：卡片列表由 **`/hub-config.json` 的 `hero_banners`** 提供；开关为主题 **`robotime_carousel_enabled`**
- **背景色**：以每条 banner 的 `bg_color` 为准；下表为 **早期需求示意**（与 `navbar-bg-colors.jpg`、规范表可能不完全一致，以设计定稿 + JSON 为准）

| 卡片名称             | 背景色（示意） | 文字色（示意） |
|----------------------|----------------|----------------|
| User Guide & Perks   | `#f6ebe3`      | `#000000`      |
| Crafting Tips & Ideas| `#ffdb04` 等   | `#000000`      |
| Ongoing Events       | `#e65e2a` 等   | `#ffffff`      |
| … | … | … |

> 💡 完整色号与 Type A/B/C 规则见 **`design-rule/DESIGN-SPEC.md`**。

#### ⚙️ 动态效果
- **整区固定 + 滚动收缩**：轮播条 **`position: fixed`** 在顶栏下；用户向下滚动后主内容正常滚动，轮播 **缩小为窄条**（类名 `robotime-carousel--collapsed`），而非滚出屏幕
- **鼠标悬停（展开态）**：
  - 缩放：`scale(1.12)`；部分卡片额外 **`rotate(5deg)`**
  - 缓动：`cubic-bezier(0.34, 1.56, 0.64, 1)`，约 `0.35s`
- **收缩态 hover**：缩放幅度减小（`scale(1.05)`），避免贴边
- **旋转规则**（按卡片顺序）：

| 卡片序号 | 是否旋转 | 角度 |
|----------|----------|------|
| 1        | 是       | 5°   |
| 2        | 是       | 5°   |
| 3        | 否       | 0°   |
| 4        | 否       | 0°   |
| 5        | 是       | 5°   |
| 6        | 否       | 0°   |
| 7        | 否       | 0°   |
| 8        | 是       | 5°   |
| 9        | 否       | 0°   |
| 10       | 否       | 0°   |

> 🔄 实现方式：通过 CSS class `.card-rotate` 控制，结合 `nth-child()` 选择器或 JS 动态添加类名。

#### 🖼️ 图片与图标
- 每张卡片包含一张插图（PNG/SVG），居中显示于上半部分
- 插图下方为标题 + 副标题（两行文本）
- 部分卡片带有箭头图标（如 “Nanci’s Dairy”、“Crafting Tips & Ideas”），用于指示可点击进入

---

### 3️⃣ 左侧边栏（Sidebar）

#### ✅ 静态样式
- **宽度**：`270px`
- **背景色**：白色 `#ffffff`
- **菜单项**：
  - `Topics`（激活状态）、`My posts`、`My messages`、`Invite Friends`、`More`
  - 字体：`Google Sans Flex-Regular`, `16px`
  - 激活项背景：`#000000`，文字色 `#ffffff`
  - 未激活项背景：`#f7f7f7`，文字色 `#000000`
  - 图标：心形、对话气泡、手形、礼盒、三点菜单（均为 SVG 或 Font Awesome）
  - 间距：每项垂直间距 `10px`，内边距 `20px`

#### 🎯 特殊区块：“Official Events”
- **位置**：位于侧栏中部偏下
- **尺寸**：宽 `240px`，高 `40px`，圆角 `20px`
- **背景色**：蓝色 `#66cbff`
- **文字**：`Official Events`, `16px`, 白色 `#ffffff`
- **下方小卡片**：
  - 展示 “Sweet Shack” 活动缩略图
  - 文字：“Sweet Shack”，灰色 `#777777`
  - “View All Events” 链接，蓝色 `#66cbff`
  - 底部 “New topic” 按钮：蓝色背景 `#66cbff`，白色文字，加号图标

#### ⚙️ 交互
- 点击 “Topics” 切换主内容区为话题列表
- “New topic” 按钮触发新建话题模态框

---

### 4️⃣ 主内容区（Main Content Area）

#### ✅ 顶部筛选栏
- **标签组**：
  - `Categories`、`Tags`、`Latest`（默认选中）、`New (34)`、`Top`、`Bookmarks`
  - 字体：`Google Sans Flex-Regular`, `24px`
  - 未选中：灰色 `#777777`
  - 选中：黑色 `#000000` + 下划线
  - 间距：横向间距 `30px`
- **第二行预显标签**：由 **主题设置 `robotime_filter_quick_tags`**（JSON）配置，**不是** hub-config 字段
- **右侧按钮**：
  - “New Topic” 按钮：浅灰背景 `#f7f7f7`，图标 + 文字，点击弹出新建话题框

#### ✅ 话题卡片列表
- **列数**：**≥1200px：3 列**；平板 **2 列**；手机 **1 列**
- **卡片尺寸**：
  - 宽度：流式栅格（非固定 `413px`）
  - 高度：自适应（随封面比例规则变化）
  - 圆角：`20px`
  - 间距：由 grid `gap` 控制（见 SCSS）
- **内容结构**：
  - 顶部横幅图（渐变蓝底 + “Official Events” 文字）
  - 标题：`Unicorn W / Rose`, `24px`, 黑色 `#000000`
  - 元数据：浏览量 `👁 120`、点赞 `👍 99`、评论 `💬 100`，字体 `16px`, 灰色 `#777777`
  - 作者头像：圆形 `40px`，右对齐
- **占位符**：无内容时显示灰色块 `#dddddd`

- 发帖规范尺寸比例裁定:
用户发帖封面仅保留两种尺寸比例1:1与3:4
判定规则:
当宽高比>0.85时(接近方图/轻微横图),判定为1:1裁剪
当宽高比<0.85时(明显竖图),判定为3:4裁剪

#### ⚙️ 交互
- 点击卡片进入话题详情页
- 点赞/评论图标可点击（需后端配合）
- 滚动加载更多内容（无限滚动或分页）

---

## 🛠 三、技术要求

### 1. 技术栈
- **模板引擎**：Handlebars（主题连接器 `.hbs`）
- **样式语言**：SCSS (Sass)
- **脚本语言**：JavaScript（`api-initializers`）
- **配置管理**：`about.json`、`settings.yml`、`locales/*.yml`（Discourse 主题标准，**非** 独立 `theme.yaml`）

### 2. 兼容性要求
- 支持主流浏览器：Chrome, Firefox, Safari, Edge（最新两个版本）
- 响应式适配：桌面端（≥1200px）、平板（768px–1199px）、手机（<768px）
- 移动端导航栏需折叠为汉堡菜单（若空间不足）

### 3. 性能优化
- 图片压缩（WebP 格式优先）
- CSS 合并与压缩
- 避免阻塞渲染的 JS
- 使用 `will-change` 优化动画性能

### 4. 可维护性
- 所有 SCSS 变量集中定义在 `_variables.scss`
- 模板文件按功能拆分（如 `header.hbs`, `sidebar.hbs`, `topic-list.hbs`）
- 注释清晰，关键逻辑标注说明

---

## 📦 四、交付物清单

1. ✅ 完整的 Git 仓库（含 `theme.yaml`, `common.scss`, `desktop.scss`, `mobile.scss`, `.hbs` 模板文件）
2. ✅ 本地开发环境搭建指南（Docker 推荐）
3. ✅ 主题预览截图（桌面 + 移动端）
4. ✅ 使用说明文档（如何安装、配置、扩展）
5. ✅ 测试报告（跨浏览器、分辨率测试结果）

---

## 🕒 五、工期估算（参考）

| 阶段               | 时间预估 |
|--------------------|----------|
| 环境搭建 + 需求确认 | 0.5 天   |
| SCSS 样式开发       | 1.5 天   |
| Handlebars 模板重构 | 1.5 天   |
| JavaScript 交互实现 | 1 天     |
| 测试 + 修复 + 交付  | 0.5 天   |
| **总计**           | **5 个工作日** |

> 💡 若需增加 Ember.js 组件或复杂动画，工期可能延长至 7–10 天。


---

✅ **备注**：本主题为“子主题”架构，依赖官方基础主题（如 `discourse-corporate`），确保升级兼容性。

---
