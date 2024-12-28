# Serv00 Monitor

一个优雅的 Serv00/CT8 面板监控工具，基于 Cloudflare Workers 构建。

![Serv00 Monitor](Serv00Monitor.jpg)

## 功能特点

- 🔐 安全的密码保护访问机制
- 🌓 优雅的深色/浅色主题切换
- 📱 完美支持移动端显示
- 🔄 一键运行所有服务器脚本
- 📊 美观的仪表盘界面
- 🤖 Telegram 机器人通知
- 🔧 自动添加定时任务
- 📝 详细的执行日志记录

## 部署说明

1. 在 Cloudflare Workers 创建新的 Worker
2. 复制 `worker.js` 内容到 Worker 编辑器
3. 创建一个名为`CRON_RESULTS的KV变量
4. 创建以下变量和机密（txt文件模板）:
   - `PASSWORD`: 前端登陆密码
   - `ACCOUNTS_JSON`: 存储账号信息
   - `TELEGRAM_JSON`: 存储 Telegram 配置
   - `CRON_RESULTS`: CRON_RESULTS

## 使用说明

1. 访问部署后的 Worker URL
2. 使用设置的密码登录
3. 查看服务器状态或点击"一键运行脚本"

## 特色功能

- 自动添加缺失的定时任务
- 支持多账号批量管理
- 实时推送执行结果到 Telegram
- 优雅的深色模式支持
- 完美适配移动端显示

## 注意事项

- 建议设置 Worker 的定时触发器以实现自动运行
- 请妥善保管账号密码等敏感信息
- 建议定期检查执行日志确保正常运行
- 首次使用时会自动添加缺失的定时任务

## 技术栈

- Cloudflare Workers
- Material Design
- Telegram Bot API

## 开源协议

MIT License

## 问题反馈

如有问题或建议,欢迎提交 Issue 或 Pull Request

## 致谢

感谢所有为本项目提供建议和帮助的朋友们
