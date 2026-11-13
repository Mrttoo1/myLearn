# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

用户已确认使用 Vue 全家桶、Python + FastAPI、PostgreSQL，并授权按推荐制作第一版。

## Users

项目拥有者有前端经验，接触过 Python，希望通过一个完整项目学习后端与部署。

## Product Purpose

以交互式教学页面为主要入口，通过流程动画、真实源码和请求实验，理解接口、校验、数据库、事务和后续发布维护。学习记录是辅助练习功能。

## Capabilities and Constraints

首页为前后端交互课，学习记录位于 `/notes`。第一期讲解服务启动、新增记录和错误排查，采用 GSAP 播放控制、流程图/时序图、源码与输入输出联动。分步演示不依赖后端；真实请求实验调用现有 API，正常保存会写入 PostgreSQL。

流程图始终展示完整系统：Vue、Vite、FastAPI、PostgreSQL；启动课额外显示终端。单步推进只更新消息、连线和处理状态，模块不能随当前步骤隐藏或换位置。使用紧凑插图和运行环境分组，避免大块模块容器占据演示区。

用户指定参考 `https://mcp-explained.com/` 的教学形式、设计风格和技术插图。界面使用纸色、墨色线条与可缩放几何设备图；插图表示浏览器、开发代理、Python 后端和数据库。保持中文讲解、简单方法和关键代码注释。服务器部署仍为后续阶段，本次本地交付。

## Evidence on Hand

用户确认的技术路线与学习计划见 `学习记录.md`。初始数据库为空，不编造用户记录或学习进度。
