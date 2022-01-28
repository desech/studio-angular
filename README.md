# Angular plugin for [Desech Studio](https://www.desech.com/)

[www.desech.com](https://www.desech.com/)

## Install

- In Desech Studio
  - Go to Settings > Plugins > Angular and install it
  - Go to File > Project Settings > Export Code Plugin > set to "Angular"

## Test the angular app

- In Desech Studio add an element and Save.
- Every time you save, the angular app files will be copied over to the `_export` folder of your desech project.
- Know that while `Desech Studio` creates new angular component files and only updates the named sections, it will not cleanup components that you have removed/moved/renamed. This also applies to storybook files. You will have to manually remove the unneeded angular files.
- There you can run the following, to test the angular app:

```sh
npm install
ng serve --open
```

- Now you can access your angular app at `http://localhost:4200/`
- Every time you save inside Desech Studio, it will push updates to the angular app

## Storybook integration

- Check the [docs](https://storybook.js.org/docs/angular/writing-stories/introduction) for further reading

```sh
export NODE_OPTIONS=--openssl-legacy-provider # linux / mac os only
set NODE_OPTIONS=--openssl-legacy-provider # windows only
npm run storybook
```

- Check the `_export/src/stories` folder for the actual stories

## Desech Studio integration

### Tips

- Inside Desech Studio there are 2 places where you can add angular attributes/properties:
  - when you click on a component
  - when you click on an html element in the HTML section > Element properties
- Here you can set any angular specific attributes like `[ngClass]`, `(click)`, `*ngIf`, etc.
- If you set a `class` property it will be added to the existing classes set by `Desech Studio`
- Make sure to name your components as verbose as possible. For example instead of `header` use `page-header` because `header` is an actual html tag, and you might create infinite loops.
- Anywhere inside text you can write code like `{{user.userId}}` and it will be exported as angular js code.
- no `routerLink`

## Plugin Development

- That's it. Ignore the rest if you don't plan on doing development on this plugin.
- It's also probably best to have `Desech Studio` closed during this step.
- If you plan on helping out with code or extend this plugin, do the following:

```sh
cd "/home/<username>/.config/Desech Studio/plugin"
  - this is the plugins folder of `Desech Studio` on Linux
  - on Mac it's `/home/<username>/Library/Application Support/Desech Studio/plugin`
  - on Windows it's `C:/Users/<username>/AppData/Desech Studio/plugin`
rm -rf desech-studio-angular
  - if you have the angular plugin already install, delete it
git clone git@github.com:desech/studio-angular.git desech-studio-angular
  - you might need to use your own fork of this repo on github
cd desech-studio-angular
sudo npm install -g @angular/cli
npm install --force
cd dist
rm -rf *
ng new my-app
  Routing: yes
  Style: CSS
cd my-app
npx sb init
- open `.storybook/main.js` and add `"staticDirs": [ "../public" ],`
rm -rf node_modules package-lock.json
cd src
rm -rf assets index.html favicon.ico app/app.component.css app/app.module.ts app/app-routing.module.ts stories
- open `tsconfig.json` and add `"allowJs": true,` and set `"strict": false,` in the `compilerOptions` object
- open `angular.json` and replace `"src/assets"` with `"src/asset", "src/font"`
- open `src/app/app.component.html` and delete everything except `<router-outlet></router-outlet>`
- open `src/app/app.component.ts` and delete the `styleUrls: ['./app.component.css']` line
```

- Now `Desech Studio` will use this git repository for the angular plugin instead of the standard one.
- Warning: Make sure you don't touch the version in the `package.json` file, because Desech Studio will try to upgrade and it will delete everything and re-download the new version of this plugin.
  - Only update the version when you git push everything and you are done with development

## Included npm packages

All Desech Studio plugins have access to the following npm libraries, because they come with the application:
- `lib.AdmZip` [adm-zip](https://www.npmjs.com/package/adm-zip)
- `lib.archiver` [archiver](https://www.npmjs.com/package/archiver)
- `lib.fse` [fs-extra](https://www.npmjs.com/package/fs-extra)
- `lib.jimp` [jimp](https://www.npmjs.com/package/jimp)
- `lib.beautify` [js-beautify](https://www.npmjs.com/package/js-beautify)
- `lib.jsdom` [jsdom](https://www.npmjs.com/package/jsdom)
- `lib.fetch` [node-fetch](https://www.npmjs.com/package/node-fetch)

## Other Documentation

- Go to [angular.io](https://angular.io/guide/setup-local) to read the documentation.


## Desech Studio website

 - [www.desech.com](https://www.desech.com/)
