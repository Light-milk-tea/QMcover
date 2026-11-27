# 学方舟做设计 · 揭幕者们

ignoredone 的封面教学，只借构图和做法，不搬立绘、标题字和 UP 的栏目名。

- 来源：[怎样学明日方舟做设计？【Vol.1-揭幕者们】](https://www.bilibili.com/video/BV1WnUTYpERQ/)（BV1WnUTYpERQ，两 P 共 7:08，2024-11-13）
- `cover.jpg`：视频封面 2560×1600（16:10），紫色漫画风，是 P1 案例的同款做法，标题换成栏目名；比较时按宽度缩到 1920 后上下各裁 60px
- `p1.mp4`：P1「讲解部分」3:44，案例 A（玛恩纳、卡西米尔队 PV-EX-8）
- `p2.mp4`：P2「追加学习」3:24，案例 B（荒芜拉普兰德、四术师 H9-6）
- `frames1/`、`frames2/`：两 P 每 2 秒一帧。A 的成品帧是 `frames1/f_112.jpg`，B 的成品帧是 `frames2/f_097.jpg`（P2 最后几秒是黑屏）
- yt-dlp 直接下会被 412 拦下：先用 view API 拿 cid，再用 playurl 取地址，CDN 换成 `upos-sz-mirrorali.bilivideo.com` 用 curl 下载

以上图片和视频都不进 git。

## 案例 A：紫幕漫画框（`frames1/f_112.jpg`、`cover.jpg`）

- 紫色舞台底：左下观众席椅子剪影，左上一条斜向深紫带，上面重复印着小字和汽车剪影，几块浅紫光斑。
- 中间一大块黑色漫画爆炸框，左上错出一层浅紫边，下沿几道放射虚线；四周散着红闪电、红星、浅棕四角星、蓝色拼图和光标徽章。
- 右侧奶油色粗糙圆环套红色圆盘，盘里有紫色斜纹、奶油锯齿和小红块；玛恩纳压在圆盘前面。
- 标题三行：上行黄色「卡西米尔队」、下行黄色「三人」，都衬紫黑棋盘格，配像素引号；中间奶油色压窄大字「PV-EX-8」，每个字微微跳动，带深红错位投影，整体斜 −7°。
- 左下三行黄色 Anton「THREE / KAZIMIERZ / OPERATOR」。

## 案例 B：红蓝黑卡（`frames2/f_097.jpg`）

- 暗紫底，红、蓝、紫三色斜向干笔刷铺满上下边，左上隐约一层立绘残影。
- 右侧毛边红盘、靛蓝弧带、五枚斜排红锯齿和光圈刻度条（22 16 11 8 5.6 4 2.8 2）；荒芜拉普兰德站在盘前，原画自带的碎片和烟雾全部去掉。
- 左侧斜放黑卡，左下错出一圈荧光黄边框和网点；卡上方黑底名牌「LAPPLAND」。
- 卡里「“四术师」宋体 Heavy 和「H9-6」软衬线压窄大字，字面压网点和斑驳，向右下挤出深红厚度，连字符换成红色尖星，右侧一个奶油色右引号。
- 角落贴红色齿轮印章、蓝色警示方块、白箭头、笑脸图标；卡下「FOUR / CASTER OPERATOR」、档案小字、斜贴黑标签和一行倒数小字。

## 已做成的模板

| 案例 | 模板 id | 名称 | 主参考 | 默认立绘 |
| --- | --- | --- | --- | --- |
| A 紫幕漫画框 | `unveil-stage` | 紫幕爆炸框 | `frames1/f_112.jpg` 裁 16:9，细节对照 `cover.jpg` | 玛恩纳精英 0 `char_4064_mlynar_1` |
| B 红蓝黑卡 | `unveil-brush` | 红蓝黑卡 | `frames2/f_097.jpg` 裁 16:9 | 荒芜拉普兰德精英 0 `char_1038_whitw2_1` |

- 视频帧是 16:10，封面在帧里横向 x 96–1828；比较时裁成 1732×974（y 偏移 53）再缩到 1920×1080。
- 立绘框 1000 见方、从画布左上角起，`contain` 装入；缩放原点放在脸上，配准后换算成 `imageScale / imageX / imageY`。
- 荒芜拉普兰德精英 0 原画带一圈灰色碎片、左上鞭梢和火花，参考里都擦掉了：在 `src/lib/artCutouts.ts` 手描人物、红披风和右手螺旋鞭的轮廓，主立绘和残影都套这层蒙版；换别的立绘不挖。
- 字体替代：A 大字用 Anton（压到 0.74），上下行用思源黑体 Heavy 横向拉宽 1.07；B 关卡码用 Fraunces 的 SOFT/WONK 轴压到 0.6，中文标题用思源宋体 Heavy。
- 共用组件：`DecorArt.tsx` 的 `StageBackdrop / StageBand / StageCrowd / TargetDisc / ComicBurst / ComicStickers / CheckerPlate / BrushBackdrop / BrushStrokes / SawDisc / NeonCard / CardBadges`，`TextFaces.tsx` 的 `ComicShadowText / ExtrudeText / PixelQuote`，配色在 `src/lib/unveilTone.ts`。
- 不做：两 P 的字幕条和右上水印、封面上的栏目名、视频里的 B 站 UI。
