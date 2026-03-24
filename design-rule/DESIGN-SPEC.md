# 导航栏轮播区设计规范

> 基于 `navbar.jpg`、`navbar-animation.jpg`、`navbar-bg-colors.jpg` 整理

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
| 标题对齐 | **左对齐** | `text-align: left` |
| 标题位置 | 卡片内部底部左侧 | `padding: 0 8px 6px` |
| Type C 渐变 | 底部半透明 | `linear-gradient(to top, rgba(0,0,0,0.5), transparent)` 底部 55% |
| Type C 文字色 | `#ffffff` | `#ffffff` |
| Type A 溢出 | 插画超出卡片顶部 ~45px | `bottom: 22px`, `width: 90%` |
| 轨道上边距 | `45px` (为溢出图标留空) | `padding-top: 50px` |

### 重要设计规则

1. **圆角统一 10px** — 非 14px
2. **文字在卡片内部底部、左对齐** — 非居中、非卡片外
3. **卡片只有一个色块**，文字覆盖在色块底部，无独立白色文字区
4. **Type A 溢出图标必须明显超出卡片上沿** — 产生立体弹出感
5. **深色背景 (#e65e2a, #582f78, #028be3) 使用白色文字**

---

## 四、Hover 动效

| 参数 | 值 |
|------|-----|
| 缩放倍率 | `scale(1.12)` |
| 旋转角度 (仅 1/2/5/8) | `rotate(5deg)` |
| 缓动曲线 | `cubic-bezier(0.34, 1.56, 0.64, 1)` (弹性回弹) |
| 过渡时长 | `0.35s` |
| 阴影 | `0 8px 24px rgba(0,0,0,0.15)` |

---

## 五、轨道滑动

| 参数 | 值 |
|------|-----|
| 缓动曲线 | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| 过渡时长 | `0.5s` |
| 每次滑动 | 2 张卡片宽度 |

---

## 六、背景色号更新记录

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
