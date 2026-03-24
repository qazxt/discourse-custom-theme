# 导航栏轮播区设计规范

> 基于 `navbar.jpg`、`navbar-animation.jpg`、`navbar-bg-colors.jpg` 整理

---

## 一、卡片数据总表

| 序号 | 名称 | 背景色 | 内部素材 | 背景素材 | Hover 旋转 |
|------|------|--------|----------|----------|------------|
| 1 | User Guide & Perks | `#f6ebe3` | `1-in.png` (书本指南插画) | `1-back.png` (底纹) | ✅ 5° |
| 2 | Crafting Tips & Ideas | `#ffdcb4` | —（暂缺） | — | ✅ 5° |
| 3 | Ongoing Events | `#f6ebe3` | `3-in.png` (彩旗/庆祝) | — | ❌ |
| 4 | Say Hi To Everyone | `#fef7e7` | `4-in.png` (HELLO 文字) | — | ❌ |
| 5 | Spin & WIN | `#ffb93e` | `5-in.png` (转盘) | `5-back.png` (底纹) | ✅ 5° |
| 6 | Showcase & Story | `#f6ebe3` | `6-in.png` (奖杯+放大镜) | — | ❌ |
| 7 | DIY & Crafting Club | `#f6ebe3` | `7-in.png` (剪刀/工具) | — | ❌ |
| 8 | Nanci's Dairy | `#f6ebe3` | `8-in.png` (兔子角色) | — | ✅ 5° |
| 9 | New Arrivals | `#f6ebe3` | `9-in.png` (NEW 徽章) | — | ❌ |
| 10 | Exclusive Deals | `#f6ebe3` | `10-in.png` (SALE 标签) | — | ❌ |
| 11 | Instruction Manual | `#f6ebe3` | `11-in.png` (剪贴板文档) | — | ❌ |

> 注：序号 2 (Crafting Tips & Ideas) 的素材暂未提供（无 `2-in.png`），当前使用 emoji 💡 占位。

---

## 二、素材文件命名规则

```
{序号}-in.png    → 卡片内部插画素材
{序号}-back.png  → 卡片背景纹理/底图素材
```

存放路径：`Icon/carousel/`

---

## 三、卡片尺寸与样式

| 属性 | 值 |
|------|-----|
| 卡片宽度 | `148px`（预览）/ `245px`（设计稿标注） |
| 图片区高度 | `109px` |
| 文字区高度 | `~26px` |
| 总高度 | `~135px` |
| 圆角 | `14px` |
| 卡片间距 | `10px` |
| 字体 | Google Sans Flex-Regular / Noto Sans |
| 标题字号 | `12px`（预览）/ `24px`（设计稿标注） |

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
