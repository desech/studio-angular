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
npm run storybook
```

- Check the `_export/src/stories` folder for the actual stories

## Desech Studio integration

### Tips

- Anchor links need to follow this format `/contact.html` with a backslash at the beginning and an `.html` extension at the end
  - `<a>` elements are not converted to `<routerLink>` because of how overrides work. You will have to add your own page history code to the application.
- Anywhere inside text you can write code like `{{user.userId}}` and it will be exported as angular js code.
  - Element attributes can contain code, but only if the attribute belongs to that html element, for example a `href` on an `<a>` element.
  - You can use element or component programming properties like `[attr.foo]` = `bar` to add any attribute.
  - If you add it as a component override, then it will no longer be parsed as code.
- Inside Desech Studio you can add angular directives in the Programming properties for both elements and components, like `*ngIf`, `[attr.foo]`, `[(ngModel)]`, etc.
  - Although we do allow any property name, if you use something like `foo$:@{_` and it obviously throws an error in angular, that's on you to handle.
  - `*ngIf`, `*ngFor` can't be overridden.
  - Other directives can be overridden, but the actual value will be a string, not code.
  - `[ngClass]` properties are ignored
- `unrender` uses `*ngIf`, so you can't have `*ngIf` or `*ngFor` with unrendered elements
- Because all pages and components are imported in `app.module.ts`, you need to make sure pages and components are not named the same.
  - Don't name components like html elements, for example `<header>`
- If you want to use curly brackets `{` and `}` as text, not as angular code, then use `{{'{'}}` and `{{'}'}}` like so: `Some object {{'{'}}id: 1{{'}'}}`. This will make angular to render it as `Some object {id: 1}`
  - If the information is coming from the database, then you will have to parse your text and replace all curly brackets with the corresponding variable

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
