# JPT Store

JPT Store is an Electron desktop app and a browser-based Progressive Web App (PWA), built with React and TypeScript.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### Web app / PWA

Run the web app locally with `npm run dev:web`, build it with `npm run build:web`,
or preview the production build with `npm run preview:web`. The production files
are written to `web-dist`.

## Publish the web app with GitHub Pages

These steps publish the browser/PWA version from the JackPaul Technologies
GitHub organization. You need permission to create repositories in the
organization and enable GitHub Pages for the repository.

### 1. Create a repository in the organization

1. Sign in to GitHub with an account that can create repositories for
   [JackPaul Technologies](https://github.com/JackPaul-Technologies).
2. Open the organization and select **Repositories → New**.
3. Enter a repository name, for example `jpt-store`.
4. Choose **Public** (the straightforward option for free GitHub Pages).
5. Leave **Add a README file**, **Add .gitignore**, and **Choose a license**
   unchecked. This project already has those files locally.
6. Select **Create repository**.

For a project site, the repository does **not** need a special
`<organization>.github.io` name. With the example name, the site URL will be
`https://jackpaul-technologies.github.io/jpt-store/`. The special
`JackPaul-Technologies.github.io` repository name is only needed for an
organization-level root site.

### 2. Push this project to GitHub

Open a terminal in the project folder. If this project has not been initialized
as a Git repository yet, run:

```powershell
git init -b main
git add .
git commit -m "Initial JPT Store app"
git remote add origin https://github.com/JackPaul-Technologies/jpt-store.git
git push -u origin main
```

If you chose a different repository name, replace `jpt-store` in the remote URL.
If the project is already pushed to GitHub, skip these commands.

### 3. Build the site and copy it into `docs`

From the project folder, run:

```powershell
npm install
npm run build:web
New-Item -ItemType Directory -Force -Path docs
Copy-Item -Path web-dist\* -Destination docs -Recurse -Force
```

Copy the **contents** of `web-dist` into `docs`, so `docs\index.html` exists;
do not put the whole `web-dist` folder inside `docs`. Then commit and push the
generated website files:

```powershell
git add docs
git commit -m "Build web app for GitHub Pages"
git push
```

### 4. Turn on GitHub Pages

1. In the repository on GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, set the source to **Deploy from a branch**.
3. Select branch **main** and folder **/docs**, then select **Save**.
4. Wait for the Pages deployment to finish. The site URL is shown on the Pages
   settings screen; for the example repository it is
   `https://jackpaul-technologies.github.io/jpt-store/`.

The site must use HTTPS for PWA installation and service-worker features. When
publishing updates, run `npm run build:web` again, copy the new `web-dist`
contents into `docs`, and commit and push the updated `docs` folder. The web app
uses hash-based navigation, so its in-app pages work on GitHub Pages project
URLs.
