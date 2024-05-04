# riao-server - Readme

Here's a rundown of where to put your code, see each file for more information:

- **src/environment.ts**: Setup environment variables here
- **src/index.ts**: You don't typically need to edit this file, it just initializes and starts your app.
- **src/log.ts**: This is your project's log, import this file to use the log. You can also extend/replace the log.
- **src/main.ts**: This is the main entrypoint for your application, after services have been registered.
- **src/register.ts**: This file initializes services such as database, SMTP, etc. that are used across different entrypoints of your application.

## Contributing & Development

See [contributing.md](docs/contributing/contributing.md) for information on how to develop or contribute to this project!
