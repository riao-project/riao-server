# Development

Run a dev test with `npm start`.

## Running Tests

To run unit tests, `npm run test`

## Scripts

You can write custom scripts in the `script/` directory. See `script/example.ts` as an example.

Run your script with `npm run script -- example`

## Compiling

### Debug Builds

To compile a debug build, run `npm run build`. The build output will appear in the `./dist` folder.

### Prod Builds

To compile a production build, run `npm run lint:prod && npm run build`. The build output will appear in the `./dist` folder.

## More

### Generating Docs

`npm run doc` and browse docs/index.html!


### Environment Variables

See `src/environment.ts` to see how to use this project's environment variables. Configure an environment in `.env` or with `process.env` (https://nodejs.org/dist/latest-v16.x/docs/api/process.html#processenv).
