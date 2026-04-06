# 导航栏轮播区设计规范

> 基于 `navbar.jpg`、`navbar-animation.jpg`、`navbar-bg-colors.jpg` 整理，并与当前主题实现对齐说明见文末「设计稿与代码」。

---

## 零、design-rule 目录资源索引

| 文件 | 内容范围（设计意图） | 备注 |
|------|----------------------|------|
| `homepage.jpg` | 主页整体标注（顶栏、轮播、侧栏、列表区相对关系） | 与 `theme-overview.jpg` 互补 |
| `theme-overview.jpg` | 主题页面总览 / 模块尺度 | 更新 UI 时应对照是否仍匹配 |
| `navbar.jpg` | 顶栏 + 轮播区尺寸、卡片规格 | 轮播卡片 **245×140、圆角 10px** 等 |
| `navbar-animation.jpg` | 顶栏与卡片 **Hover** 动效参数 | 与 §五 一并使用 |
| `navbar-bg-colors.jpg` | 各卡背景色 **迭代标注** | 与 §二 数据表、§七 **可能不一致** — 以运营在 `hub-config.json` 的 `bg_color` + §二 白/黑字规则为准；需设计侧统一时再改稿 |
| `DESIGN-SPEC.md` | 本文档（从 JPG 抽取的结构化规范） | 与代码冲突时优先以仓库内实现 + `PLUGIN-INTERFACE.md` 为准，再回写本文与配图 |

**原则**：新增或替换 JPG 后，应在本表与相关章节同步一句「最后对照日期」，避免文档长期脱节。

---

## 一、卡片布局类型

卡片分为三种布局类型（Type A / B / C），文字标签统一在卡片内部底部。

### Type A — 立体溢出 (Icon Overflow)

图标/插画**超出卡片顶部边缘**，产生 3D 立体弹出感。背景为纯色。

适用: Card 1, 3, 8

### Type B — 居中图标 (Centered Icon)

图标/插画居中显示在卡片内部。部分卡片有背景纹理。

适用: Card 2, 4, 5, 6, 9, 10

### Type C — 全幅照片背景 (Full-Bleed Photo)

图片填充整个卡片作为背景。底部有渐变暗色遮罩 (`linear-gradient(to top, rgba(0,0,0,0.45), transparent)`)，文字为白色以保证可读性。

适用: Card 7, 11

---

## 二、卡片数据总表

| 序号 | 名称 | 类型 | 背景色 | 内部素材 | 背景素材 | Hover 旋转 |
|------|------|------|--------|----------|----------|------------|
| 1 | User Guide & Perks | A | `#f6ebe3` 暖米 | `1-in.png` (书本指南) | `1-back.png` | ✅ 5° | 黑字 |
| 2 | Crafting Tips & Ideas | B | `#ffdb04` 亮黄 | —（暂缺） | — | ✅ 5° | 黑字 |
| 3 | Ongoing Events | A | `#e65e2a` 橙红 | `3-in.png` (礼物盒) | — | ❌ | **白字** |
| 4 | Say Hi To Everyone | B | `#fef7e7` 浅黄 | `4-in.png` (HELLO) | — | ❌ | 黑字 |
| 5 | Spin & WIN | B | `#ffb93e` 橙色 | `5-in.png` (转盘) | `5-back.png` | ✅ 5° | 黑字 |
| 6 | Showcase & Story | B | `#582f78` 深紫 | `6-in.png` (奖杯) | — | ❌ | **白字** |
| 7 | DIY & Crafting Club | **C** | `#fef7e7` 浅黄 | `7-in.png` (手工照片) | — | ❌ | 白字(渐变) |
| 8 | Nanci's Dairy | A | `#bdb1ff` 淡紫 | `8-in.png` (兔子) | — | ✅ 5° | 黑字 |
| 9 | New Arrivals | **A** | `#028be3` 蓝色 | `9-in.png` (小屋溢出) | — | ❌ | **白字** |
| 10 | Exclusive Deals | B | `#d7c8a2` 米金 | `10-in.png` (SALE) | — | ❌ | 黑字 |
| 11 | Instruction Manual | **C** | `#fef7e7` 浅黄 | `11-in.png` (人物照片) | — | ❌ | 白字(渐变) |

> 注：序号 2 (Crafting Tips & Ideas) 的素材暂未提供（无 `2-in.png`），当前使用 emoji 💡 占位。

---

## 三、素材文件命名规则

```
{序号}-in.png    → 卡片内部插画素材 / 全幅背景照片
{序号}-back.png  → 卡片背景纹理/底图素材（仅部分卡片有）
```

存放路径：`Icon/carousel/`

---

## 四、卡片尺寸与样式

> 参考设计稿标注：宽 245px、图片区高 109px、文字区高 18px、总容器高 140px、圆角 10px

| 属性 | 设计稿标注值 | 预览实现值（等比缩放约 0.6x） |
|------|-------------|-------------------------------|
| 卡片宽度 | `245px` | `148px` |
| 卡片高度 (纯色区) | `109px` | `66px` |
| 文字区高度 | `18px` (内含于卡片底部) | 内含于卡片底部 |
| 总容器高度 | `140px` (含溢出空间) | `~116px` (66px + 溢出) |
| 圆角 | **`10px`** | `10px` |
| 卡片间距 | `18px` | `10px` |
| 字体 | Google Sans Flex-Regular | Noto Sans (替代) |
| 标题字号 | **`24px`** | `14px` (等比缩放) |
| 标题字重 | Regular → `700` (加粗以补偿小字号) | `700` |
| 标题对齐 | **左对齐**（标注） | 代码多为 **`center`**（以 `common.scss` 为准） |
| 标题位置 | 卡片内部底部左侧 | `padding: 0 8px 6px` |
| Type C 渐变 | 底部半透明 | `linear-gradient(to top, rgba(0,0,0,0.5), transparent)` 底部 55% |
| Type C 文字色 | `#ffffff` | `#ffffff` |
| Type A 溢出 | 插画超出卡片顶部 ~45px | `bottom: 22px`, `width: 90%` |
| 轨道上边距 | `45px` (为溢出图标留空) | `padding-top: 50px` |

### 重要设计规则

1. **圆角统一 10px** — 非 14px
2. **文字在卡片内部底部**；标注稿多写 **左对齐**，当前 Discourse 主题为 **水平居中**（见 §十一）；定稿时请统一设计或改 SCSS
3. **卡片只有一个色块**，文字覆盖在色块底部，无独立白色文字区
4. **Type A 溢出图标必须明显超出卡片上沿** — 产生立体弹出感
5. **深色背景 (#e65e2a, #582f78, #028be3) 使用白色文字**

---

## 五、Hover 动效

| 参数 | 值 |
|------|-----|
| 缩放倍率 | `scale(1.12)`（Discourse 主题内卡片 hover；**收缩态**下为 `scale(1.05)`，见 `common.scss`） |
| 旋转角度 (仅 1/2/5/8) | `rotate(5deg)` |
| 缓动曲线 | `cubic-bezier(0.34, 1.56, 0.64, 1)` (弹性回弹) |
| 过渡时长 | `0.35s` |
| 阴影 | `0 8px 24px rgba(0,0,0,0.15)` |

---

## 六、轨道滑动

| 参数 | 值 |
|------|-----|
| 缓动曲线 | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| 过渡时长 | `0.5s` |
| 每次滑动 | 2 张卡片宽度 |

---

## 七、背景色号更新记录

来源：`design-rule/navbar-bg-colors.jpg`

本次更新确认了以下背景色号，与初版一致：

| 卡片 | 色号 | 备注 |
|------|------|------|
| Card 1 (User Guide) | `#f6ebe3` | 暖米色 |
| Card 2 (Crafting Tips) | `#ffdcb4` | 桃色 |
| Card 3 (Ongoing Events) | `#f6ebe3` | 暖米色 |
| Card 4 (Say Hi) | `#fef7e7` | 浅黄 |
| Card 5 (Spin & WIN) | `#ffb93e` | 橙色 |
| Card 6 (Showcase) | `#f6ebe3` | 暖米色 |
| Card 7 (DIY Club) | `#f6ebe3` | 暖米色 |
| Card 8 (Nanci's Dairy) | `#f6ebe3` | 暖米色 |
| Card 9 (New Arrivals) | `#f6ebe3` | 暖米色 |
| Card 10 (Exclusive Deals) | `#f6ebe3` | 暖米色 |
| Card 11 (Instruction Manual) | `#f6ebe3` | 暖米色 |

> **说明**：上表来自单色稿迭代；**§二 卡片数据总表** 中按语义保留了橙/紫/蓝等强调色。线上卡片底色以 JSON `bg_color` 为准。设计若定稿为一种体系，应 **更新 JPG + §二 + §七** 三处一致。

---

## 八、侧栏底部活动轮播区（Official Events）

> 对应首页左侧栏菜单下方的推广/活动轮播模块（数据由插件 `/hub-config.json` 提供，后台可配置）。

### 8.1 纵向结构（自上而下）

| 区块 | 配置字段 | 说明 |
|------|----------|------|
| 区块标题 | `sidebar_section_title` | 显示在轮播图**上方**；品牌蓝底、白字、圆角 `12px`、水平居中 |
| 轮播内容 | `sidebar_widgets[]` | 一张时为静态卡片；多张时约 **5s** 自动切换，卡片下方 **圆点**指示当前张 |
| 单张卡片内标题 | `sidebar_widgets[].title` | 显示在**图片下方**（灰字说明性标题，非顶部区块标题） |
| 底部操作 | `sidebar_view_all` | **轮播整体下方**的「查看全部」链接：`label` + `url`，可选外链 `is_external` |

### 8.2 样式要点

| 元素 | 样式要点 |
|------|----------|
| 区块标题条 | 背景 `#66cbff`，文字白色，字重约 `600`，内边距约 `8px 12px`，圆角 `12px` |
| 轮播卡片 | `border: 1px solid #eee`，圆角 `12px`，图片区 `max-height: 160px`、`object-fit: cover` |
| 圆点指示器 | 未选中 `#dddddd`，选中 `#66cbff`，间距约 `6px` |
| View all 链接 | 全宽居中、圆角 `12px`、浅灰描边，Hover 时浅灰底、文字接近黑色 |

### 8.3 交互

- 多张轮播时仅**中间卡片+圆点**切换；**顶部区块标题与底部 View all 固定**，不随幻灯片变化。

---

## 九、内容区上方筛选条（Categories / Tags / Tabs / 预显标签）

> 对应主页主内容区顶部的筛选与快捷标签（列表页 `.list-controls`）。**Categories、Tags、Latest 等**由 Discourse 原生提供；**预显标签**由 **主题设置** `robotime_filter_quick_tags`（`settings.yml`）提供。**`hub-config.json` 中的 `filter_quick_tags`（若有）主题会忽略**，详见 `PLUGIN-INTERFACE.md`。

### 9.1 第一行

| 元素 | 视觉 | 字号 / 颜色（设计稿） |
|------|------|------------------------|
| Categories、Tags | **圆角框 + 下拉三角**，框线与文字、三角均为 `#777777` | **24px**（桌面）；点击前后同色 |
| Latest、New、Top、Bookmarks | 纯文字 Tab；未选中灰 `#777777`，选中 **黑 `#000000` + 下划线** | **24px** |
| 间距 | 左侧距容器约 **51px**（由主题与 Discourse 容器共同决定）；下拉内文字距左边框 **15px**；文字与三角约 **20px**；两下拉间距 **10px**；Tags 与 Latest 间距 **30px**；Tab 之间 **30px** | — |

主题实现要点：`select-kit-header` 加 `1px solid #777`、`border-radius: 12px`；`.nav-pills` 使用 `gap: 30px` 等（见 `common/common.scss`）。

### 9.2 第二行 — 预显标签（主题 `robotime_filter_quick_tags`）

| 属性 | 值 |
|------|-----|
| 位置 | 紧贴第一行**下方**，纵向间距约 **10px** |
| 文案 | 以 `#` 开头的标签名（管理员在主题设置 JSON 中配 `label`，主题可自动补 `#`） |
| 字号 | **16px** |
| 颜色 | 默认 `#777777`；**选中 / 点击** ：下划线 + 可视为强调（主题用黑字 `#000000`） |
| 横向间距 | 标签之间 **30px** |
| 配置 | **仅** Theme settings：`robotime_filter_quick_tags`（JSON 数组字符串）；**非** hub-config |

### 9.3 移动端

- 下拉与 Tab 字号略缩小、可横向滚动；预显标签行可横向滑动（见 `mobile/mobile.scss`）。

---

## 十、顶栏 + 分类轮播：固定视口与滚动收缩（实现对齐）

设计稿 JPG 多截取「首屏静态」；**真实站点**上顶栏与轮播应 **始终贴在视口顶部**（与仓库内 `preview.html` 中 `#global-hub-header { position: fixed } + 占位` 一致），滚动时 **轮播区收缩**而非整块滚走。

| 要点 | 实现位置 |
|------|----------|
| 顶栏容器 `.robotime-above-header` | `position: fixed; top: 0; left/right: 0; z-index: 1200`（`common.scss`） |
| 轮播 `#robotime-carousel` | `position: fixed; top: var(--robotime-topbar-height); z-index: 1190`；桌面顶栏高 **60px**，移动 **52px**（`html` / `mobile.scss` 变量） |
| 主内容不被遮挡 | `#main-outlet-wrapper { padding-top: var(--robotime-header-offset) }`；`--robotime-header-offset` 由 `robotime-hub.js` 根据顶栏 + 轮播 **实际高度** 写入 `html` 样式 |
| 滚动收缩 | `window` 滚动超过约 **100px** 且页面可滚动时，为轮播根节点加 `robotime-carousel--collapsed`；回到顶部附近 **28px** 内展开（见 `robotime-hub.js` 常量） |
| 收缩视觉 | 区背景 **黑**、卡片变小、图与渐变遮罩隐藏、轨道 `gap` 缩小、箭头改为浅色半透明样式；**与 preview 的 `.layer-b.collapsed` 一致** |
| 侧栏 sticky | 桌面 `.sidebar-wrapper` 的 `top` 已用 `calc(var(--robotime-header-offset) + 8px)`，随折叠高度变化 |

**交互稿对照**：`preview.html` 内联脚本中的 `collapsed` / `#content-spacer` 与线上 **变量占位** 方案等价（线上无单独 spacer 节点，用 wrapper 的 `padding-top`）。

---

## 十一、设计稿与代码的常见差异备忘

| 项目 | 设计稿（JPG / 旧说明） | 当前代码（权威来源） |
|------|------------------------|---------------------|
| 轮播卡片标题对齐 | §四 写「左对齐」 | `common.scss` 中 `.robotime-carousel__card-label` 为 **居中**；若需改稿或改代码须二选一统一 |
| 卡片间距 | 早期写 `18px` / 多版并存 | 主题轨道 `gap: 45px`（展开）；收缩桌面 `20px`、移动 `10px` |
| 预显标签数据源 | 旧文档写 hub JSON | **仅** `settings.yml` → `robotime_filter_quick_tags` |
| 话题列表列数 | 部分描述写「桌面 2 列」 | **≥1200px：3 列**；768–1199：**2 列**；&lt;768：**1 列**（`desktop.scss` / `mobile.scss`） |
| 顶栏与轮播滚动 | JPG 多为静态、未写 sticky | **固定 + 收缩**，见 §十 |
