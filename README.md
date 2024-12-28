# Serv00 Monitor

An elegant Serv00/CT8 panel monitoring tool built on Cloudflare Workers.

![Serv00 Monitor](/img/Serv00Monitor.jpg)

![serv00666](/img/serv00666.png)

##Major Update!
- Added functionality to allow running scripts for individual accounts
- Optimized UI interface and text, removed seconds from update time
  
## Features

- 🔐 Secure password-protected access
- 🌓 Elegant dark/light mode toggle
- 📱 Fully mobile-friendly design
- 🔄 One-click execution of all server scripts
- 1️⃣ Support for running individual account scripts in the frontend
- 📊 Aesthetic dashboard interface
- 🤖 Telegram bot notifications
- 🔧 Automatic addition of cron jobs
- 📝 Detailed execution log records

## Deployment Instructions

1. Create a new Worker in Cloudflare Workers
2. Copy the worker.js content into the Worker editor
3. Create a KV variable named CRON_RESULTS
4. Set the following variables and secrets (based on provided .txt templates):
- `PASSWORD`: Login password for the frontend
- `ACCOUNTS_JSON`: Stores account information
- `TELEGRAM_JSON`: Stores Telegram configuration
- `CRON_RESULTS`: Stores cron results

## Usage Instructions

1. Access the deployed Worker URL
2. Log in using the set password
3. View server status or click "Run All Scripts"

## Key Features

- Automatically add missing cron jobs
- Support for multi-account batch management
- Real-time execution results pushed to Telegram
- Elegant dark mode support
- Fully optimized for mobile displays

## Notes

- It is recommended to set up a scheduled trigger for the Worker to enable automatic execution.
- Keep sensitive information like passwords and account details secure.
- Periodically check execution logs to ensure normal operation.
- Missing cron jobs will be automatically added during first-time use.

## Tech Stack

- Cloudflare Workers
- KV Storage
- Material Design
- Telegram Bot API

## License

MIT License

## Feedback

If you have any issues or suggestions, feel free to submit an Issue or Pull Request.

## Acknowledgements

Thanks to everyone who contributed suggestions and help for this project.

