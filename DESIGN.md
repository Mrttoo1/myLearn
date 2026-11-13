---
name: 前后端图解
description: 暖纸色、墨色技术线稿与同步源码的中文交互课程；学习记录为辅助练习。
colors:
  course-ink: "#34342e"
  course-muted: "#68695f"
  course-line: "#d9d5cb"
  course-green: "#526b5a"
  course-ochre: "#a16c43"
  course-dark: "#343e32"
  course-dark-hover: "#465640"
  course-sidebar: "#f2f1eb"
  course-inspector: "#f5f4ee"
  course-field: "#faf9f5"
  course-source: "#eeede6"
  course-error: "#b64d37"
  paper: "#f7f6f1"
  ink: "#243c32"
  muted: "#5c685e"
  accent: "#2d614a"
  accent-hover: "#214b39"
  line: "#dcded4"
  white: "#ffffff"
  secondary-hover: "#e9ede3"
  selected: "#edf1e8"
  note-body: "#4a5d50"
  editor: "#eeeee5"
  field: "#fafbf6"
  field-border: "#7f8b7c"
  placeholder: "#657060"
  focus: "#478764"
  danger: "#9b3c2e"
  error-paper: "#f7e9e0"
  error-ink: "#853525"
typography:
  lesson-title:
    fontFamily: "'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  step-title:
    fontSize: "18px"
    fontWeight: 550
    lineHeight: 1.6
  lesson-body:
    fontSize: "13px"
    lineHeight: 1.85
  lesson-control:
    fontSize: "12px"
  code:
    fontSize: "12px"
    lineHeight: 1.95
  headline:
    fontFamily: "'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif"
    fontSize: "clamp(30px, 3vw, 40px)"
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: "-0.025em"
  section-title:
    fontSize: "18px"
    fontWeight: 650
  note-title:
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.6
  body:
    fontSize: "14px"
    lineHeight: 1.9
  button:
    fontSize: "14px"
    fontWeight: 600
  field:
    fontSize: "14px"
    lineHeight: 1.7
  meta:
    fontSize: "12px"
rounded:
  lesson-control: "5px"
  compact: "4px"
  control: "6px"
  editor: "12px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  control: "20px"
  group: "24px"
  panel: "28px"
  compact-columns: "32px"
  columns: "56px"
components:
  course-button:
    backgroundColor: "{colors.course-dark}"
    textColor: "{colors.white}"
    typography: "{typography.lesson-control}"
    rounded: "{rounded.lesson-control}"
    padding: "9px 12px"
  course-button-hover:
    backgroundColor: "{colors.course-dark-hover}"
  course-button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.course-ink}"
    typography: "{typography.lesson-control}"
    rounded: "{rounded.lesson-control}"
    padding: "9px 12px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "11px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    padding: "8px 4px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.danger}"
    padding: "8px 4px"
  field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.field}"
    rounded: "{rounded.control}"
    padding: "13px 14px"
  editor:
    backgroundColor: "{colors.editor}"
    rounded: "{rounded.editor}"
    padding: "24px 28px 28px"
  error:
    backgroundColor: "{colors.error-paper}"
    textColor: "{colors.error-ink}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
---

# Design System: 前后端图解

## Overview

**Creative North Star: "纸上技术图解"**

暖纸色、墨色线条和低饱和绿棕色构成阅读环境。用户指定 [MCP Explained](https://mcp-explained.com/) 的教学、视觉与技术插图方向；当前首页将交互流程、中文解释和真实项目源码并置。技术设备是 `TechnicalDevice.vue` 中原创编写的几何 SVG，保持可缩放线稿和少量明暗面。

本记录从 `frontend/src/lesson.css`、`flow-interaction.css`、`styles.css`、`App.vue`、`views/LearnView.vue` 和现有图示、播放器、请求实验组件提取。首页是交互课程，原有纸上手记模式保留于辅助入口 `/notes`。前置 course/lesson 令牌描述课程；既有记录页令牌继续用于辅助页面，不替代课程配色。

本轮交互记录以源码为依据；浏览器连接不可用，未执行新截图验收，旧截图不作为本轮证明。

**Key Characteristics:**

- 暖纸色平面、墨色技术线稿与绿棕色状态强调。
- 课程目录、完整稳定拓扑和源码检查并列；全部模块按运行环境紧凑分组，只随屏宽重排。
- GSAP 分别控制消息发送与阅读等待，历史查看独立于当前播放位置。
- 示例演示与真实请求分别标明，学习记录使用真实数据。

## Colors

前置令牌为规范来源；课程以中性暖纸色和炭墨为主体。

### Primary

- **炭墨**（course-ink）：课程正文与控制文字；**深绿墨**（course-dark）：播放和真实请求主按钮，悬停使用 course-dark-hover。
- **沉绿**（course-green）：时序箭头与处理状态；**绿墨**（accent）：辅助记录页主操作。

### Secondary

- **赭棕**（course-ochre）：命令行设备细节和技术强调。

### Neutral

- **纸白**（paper）：全页底色与全局页头；course-sidebar / course-inspector 区分目录和检查区。
- course-muted 用于说明，course-line 用于结构分隔；course-field / course-source 为实验输入和源码阅读底色。
- `/notes` 保留 ink、muted、line、editor、field、selected、note-body 等既有令牌，错误提示保留 danger / error-paper / error-ink。

课程异常数据流使用 course-error，键盘焦点使用 focus；状态同时提供文字。

## Typography

中文优先的系统无衬线字体承担讲解和操作，代码、路径及请求方法使用等宽字体。没有独立装饰性展示字体。

- **Lesson title**：课程主标题，小屏缩至（24px）。
- **Step title**：当前步骤标题，小屏缩至（17px）。
- **Lesson body**：步骤解释；介绍与检查面板行高分别为（1.9 / 1.95），解释宽度控制在（64–68ch）。
- **Lesson control**：播放和实验控件；目录步骤同为（12px），次级标记为（10–11px）。
- **Code**：源码和技术内容，小屏源码缩至（11px）；步骤与行号使用等宽数字。
- `/notes` 保留 headline、section-title、note-title、body、button、field 和 meta 层级；headline 响应字号仅用于记录页。

## Layout

全局页头高度（66px），随页面粘顶。桌面课程占余下视口，三列为目录（220px）、自适应演示区和检查区（354px），各列独立纵向滚动。标题与步骤区主要水平内边距（30px），检查区（24px）。

不小于（1600px）时两侧列扩为（250px / 390px）；不大于（1250px）时收至（202px / 320px）。不大于（1100px）时检查区排到演示下方，目录继续粘顶，页面纵向阅读。不大于（700px）时改单列，页头（62px），目录通过按钮展开，主图中的全部模块持续显示，并按运行环境紧凑分组：浏览器与 Vite 共享本机前端区，数据库位于左上、Python 后端位于右中，启动课程的独立终端位于右下；小屏使用压缩后的同类分组布局。模块坐标只随屏宽变化，不随当前步骤改变。桌面 SVG 画布为（1000×480），启动课程为（1000×600）；小屏分别为（800×600 / 800×650），随容器等比缩放。消息连线连接设备两侧，同列终端到 API 的命令从右侧绕行。时序图完整累计并可横纵滚动；消息表与代码在自身区域滚动，避免撑宽页面。

辅助 `/notes` 保留最大（1200px）居中容器、桌面左右边距（48px）、列表与编辑栏并排和列间距（56px）。不大于（1000px）时边距与列间距均为（32px）；不大于（760px）时边距（20px），编辑区排在列表之前。不大于（390px）时介绍与新建按钮允许换行。全站最小宽度（320px）。

## Elevation & Depth

没有投影。浅底色、细边框与设备几何明暗面提供层次；流程图浅点阵与虚线表示空间和连接。

**The Flat Paper Rule.** 保持表面平整，以色阶与分隔线表达分组。

## Shapes

课程按钮使用紧凑小圆角，选择器与图示切换使用 compact。全局字段和记录页控件沿用 control，记录编辑区沿用 editor。运行环境分组使用圆角（16px），本机前端区为实线边界，其余分组为虚线。设备图标为（112×112）画布单位，分组高度为（207）画布单位，浏览器与 Vite 共享边界。步骤编号为圆形。带方法名的胶囊标记仅在空白区域显示；本地处理用现有节点的虚线圈和底部方法名说明，不浮出大胶囊。原创设备 SVG 继续使用圆端、圆连接墨线（1.5px）。

## Components

### Buttons

课程实底按钮用于播放和发送请求，透明底按钮用于逐步阅读。桌面最小高度（38px），小屏（40px），背景变化（160ms ease-out）。全局焦点轮廓（3px）、外偏移（4px）；禁用透明度（0.55）。辅助记录页保留（44px）最小高度的主按钮、分页次级按钮与带悬停下划线的文字操作。

### Inputs / Fields

`RequestLab.vue` 复用带可见标签的输入、文本域和场景选择器，忙碌时禁用。结果显示真实 HTTP 状态、耗时和响应；正常保存按钮明确写入记录。`/notes` 保留必填提示、字符计数与可纵向缩放文本域。

### Navigation

`App.vue` 提供交互课程和学习记录两入口，当前入口以底部细线标明。`LearnView.vue` 章节展开当前课程，步骤显示当前与已访问状态；小屏选择后收起目录。解释、项目文件、真实请求三个检查标签保留选中线与键盘切换。切换课程将演示和检查列滚回顶部。

### Flow Diagram / Player

`FlowDiagram.vue` 根据整节课决定可见角色，始终显示浏览器、Vite、API 和数据库；启动课程额外显示本机终端。所有模块的位置在同一屏宽下保持稳定，并按运行环境分组，浏览器与 Vite 共用本机前端边界。本地处理在现有节点上圈示，其他模块继续显示。设备复用 `TechnicalDevice.vue` 中原创几何 SVG，设备本身不点击跳步。

全部连接持续显示：尚未经过的连接为虚线，已走过的连接为实线，当前路线高亮。消息沿设备侧面的真实路线移动，浏览器与 API 之间的简写仍经过 Vite，并标明开发代理。Vite 入站和出站由独立的 activeTracks 路段分别推进，连线不穿过设备；同列终端到 API 的命令从右侧绕行。启动命令使用独立终端角色，不与 API 进程混同，未启动的服务标注“尚未启动”。

`ResizeObserver` 根据实际容器宽度补偿 SVG 文字与消息标记尺寸。带方法名的消息标签限制在画布内，支持鼠标与键盘查看详情，仅在不遮挡模块的空白处显示，否则保留消息点。完整方法名始终在图下方的 HTML“当前消息”区域显示。

`useLessonPlayer.ts` 为一次发送使用独立 GSAP 动画（0.95 秒，power2.inOut）；自动播放到达后再使用阅读等待动画（1.65 秒），最后一条到达后停止。手动“下一步”也播放完整发送，到达后停留。发送与等待都支持暂停、恢复和倍速；上一步与重置可以直接显示到达状态。步骤、图示、过程记录和当前源码读取一致的播放状态。减少动态效果时将消息包固定在到达点、轨迹固定为完成态，保留方法名、方向和状态说明。真实 fetch 实验独立于演示动画。

时序图保留完整累计消息，未来消息弱化显示，并随当前步骤滚动。点击历史或当前消息会暂停播放，只切换右侧检查内容，不回退播放位置；点击未来消息则跳到该条并播放发送。主图消息、时序行与过程记录共用此查看规则，历史检查提供“回到当前步骤”。

### Source Inspector

`LearnView.vue` 将解释、路径、真实行号及输入输出并置，路径可复制，代码可局部滚动。源码来自 Vite 固定白名单虚拟模块，不读取 `.env`；文件树浏览同一批真实文件。

### Auxiliary Notes

`NotesView.vue` 内保留分隔式记录列表、浅底编辑容器、分页、空状态与错误重试模式，并未拆成独立组件。时间、数量、页码和正文来自真实数据，摘要最多四行；编辑中条目使用浅底。sidecar 的记录页 HTML/CSS 只预览这些现有模式。

## Do's and Don'ts

### Do:

- **Do** 保持暖纸色平面、墨线技术设备和清楚的中文讲解。
- **Do** 保留整节课的全部模块与稳定位置，用连线和高亮表达处理进度；发送与阅读等待保持一致，历史检查独立于播放位置。
- **Do** 标明示例演示、源码来源与真实请求结果，记录页显示真实数据。
- **Do** 保留字段标签、键盘焦点与异常文字；小屏保留完整内容与可展开目录。

### Don't:

- **Don't** 将辅助学习记录作为课程首页的主视觉与布局依据。
- **Don't** 将原创 SVG 设备描述为生成图片或外部素材。
- **Don't** 用模拟进度填充真实记录空状态，或暗示播放控制能暂停真实后端事务。
- **Don't** 将平面分隔式内容改成重复悬浮卡片，或降低字段、辅助文字和焦点的可辨识度。
