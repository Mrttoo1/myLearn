# Vue 前端

完整启动步骤和学习顺序见 [项目 README](../README.md)。

- `src/views/LearnView.vue`：教学首页，联动流程、代码和消息记录。
- `src/lessons/content.ts`：课程内容与项目文件对应关系。
- `src/composables/useLessonPlayer.ts`：GSAP 播放头和播放控制。
- `src/components/`：流程图、几何设备插图、真实请求实验等组件。
- `src/views/NotesView.vue`：辅助的记录列表、表单和交互，地址为 `/notes`。
- `src/api/`：HTTP 请求与接口方法。
- `src/stores/connection.ts`：页头与页面共享的服务连接状态。
- `vite.config.ts`：开发服务器与接口代理。
- `lessonSourcesPlugin.ts`：构建时读取白名单源码，供课程展示。

前端只操作 HTTP 接口，数据库连接信息保留在后端。
