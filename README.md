# [Storybook for Django](https://storybook-django.herokuapp.com/) [<img src="https://raw.githubusercontent.com/torchbox/storybook-django/main/.github/storybook-django-logo.svg?sanitize=true" alt="Demo site" width="90" height="90" align="right">](https://storybook-django.herokuapp.com/)

[![npm](https://img.shields.io/npm/v/storybook-django.svg)](https://www.npmjs.com/package/storybook-django) [![Build status](https://github.com/torchbox/storybook-django/workflows/CI/badge.svg)](https://github.com/torchbox/storybook-django/actions)

Storybook for Django is an experimental UI development environment for Django components. It allows you to implement, document, and test UI components in isolation from your Django views. Have a look at our [online demo](https://storybook-django.herokuapp.com/).

![Screenshot of the Storybook UI, with a Django UI component displaying](.github/storybook-django-screenshot.png)

## How it works

Server-side, this uses [django-pattern-library](https://github.com/torchbox/django-pattern-library) to mock template context and template tags. Client-side, we use [Storybook](https://storybook.js.org/) to create stories from our templates.

## Getting started

Let’s get you set up. There are two requirements:

1. First, start by setting up [django-pattern-library](https://github.com/torchbox/django-pattern-library), v0.7.0 and up. Have a look at our [demo settings.py](https://github.com/torchbox/storybook-django/blob/main/demo/settings.py) as an example.
2. Then, set up [Storybook](https://storybook.js.org/). We expect `storybook-django` to work with any framework supported by Storybook, and provide built-in support for React (Vue in progress).

Next, install our package:

```sh
npm install --save-dev storybook-django
```

### Middleware

Add a `middleware.js` inside your Storybook configuration folder (`.storybook` by default):

```js
const { createDjangoAPIMiddleware } = require('storybook-django/middleware');

module.exports = createDjangoAPIMiddleware({
  // Point this at your Django runserver instance, with the correct port number.
  origin: 'http://localhost:8001',
  apiPath: ['/pattern-library/'],
});
```

This will forward pattern library API requests to Django. You may optionally add more API path patterns to `apiPath` to make other requests to your Django backend.

### Optional Webpack configuration

This is optional but highly recommended. To leverage Storybook’s live-reloading and documentation capabilities, we need to configure it to load our templates. Edit your Storybook `main.js` file to customise the `webpackFinal` option:

```js
module.exports = {
  webpackFinal: (config) => {
    config.module.rules = config.module.rules.concat([
      {
        test: /\.html$/,
        // Webpack 5:
        type: 'asset/source',
        // Webpack 4 (make sure to also install the raw-loader package):
        // use: 'raw-loader',
      },
    ]);

    return config;
  }
```

### React usage

Here is the most basic story for a Django template:

```js
import { Pattern } from 'storybook-django/react';

export default {};

export const Base = () => (
  <Pattern
    template="patterns/components/streamfield/heading_block.html"
    context={{ value: 'An important section' }}
  />
);
```

`Pattern` uses a hard-coded `endpoint` of `/pattern-library/api/v1/render-pattern` by default. To change this, pass a different value. For example,

```js
<Pattern endpoint="/storybook-patterns/api/v1/render-pattern" />
```

If this is a necessity for your project, consider creating your own wrapper for the `Pattern` component rather than having to define the `endpoint` in all stories.

#### With auto-generated template paths

Our `Pattern` component has to be told which `template` to render, Alternatively, we can use [Webpack’s `__filename`](https://webpack.js.org/api/module-variables/#__filename-nodejs) support to auto-generate the template path. First, configure Webpack:

```js
config.node = {
  __filename: true,
};
```

Then, use the `filename` prop instead of `template`:

```js
<Pattern filename={__filename} />
```

This `filename` prop assumes the template is in the same folder as the template, with the same file name except for the extension (replaces `.stories.(js|tsx)` with `.html`).

#### With Storybook features

And here is a more advanced examples, showcasing different Storybook features:

- Setting a custom title for the story.
- Loading Markdown files to use as documentation.
- Loading the component’s template to display alongside the docs, and for live-reloading.
- Setting up [controls](https://storybook.js.org/docs/react/essentials/controls).
- Having multiple stories with different data.

```js
import { Pattern } from 'storybook-django/react';

import docs from './quote_block.md';
import template from './quote_block.html';

export default {
  title: 'Components / quote_block',
  parameters: {
    docs: {
      source: { code: template },
      extractComponentDescription: () => docs,
    },
  },
  argTypes: {
    quote: {
      control: { type: 'text' },
      description: 'Will be displayed first',
    },
    attribution: {
      control: { type: 'text' },
      description: 'Underneath the quote (optional)',
    },
  },
};

export const Base = (args) => (
  <Pattern filename={__filename} context={{ value: args }} />
);

Base.args = {
  quote: 'Someone believed in me once and now it’s time for me to do the same.',
  attribution: 'Young person',
};

export const NoAttribution = Base.bind({});

NoAttribution.args = {
  quote: Base.args.quote,
  attribution: null,
};
```

#### Making the most of React

The point of using React is to be able to fully customise the context within which our Django components are displayed. Here is an example, with a simple SVG icon template:

```js
const IconPattern = (props) => (
  <Pattern
    element="span"
    template="patterns/components/icon/icon.html"
    context={props}
  />
);

export const ReactDemoStory = () => (
  <span>
    <a href="https://www.example.com">
      View our complete guide <IconPattern name="arrow" />
    </a>
  </span>
);
```

### Vue usage

We are working on Vue support. Please refer to [Usage with Vue #7](https://github.com/torchbox/storybook-django/issues/7) in the meantime, and provide feedback.

### Usage with other frameworks

storybook-django’s implementation is largely framework-agnostic, and should work equally as well with Storybook’s HTML and Web Components support.

You will need to directly import the imperative APIs:

```js
import {
  renderPattern,
  simulateLoading,
  insertHTMLWithScripts,
} from 'storybook-django';
```

- `renderPattern` calls the django-pattern-library API rendering endpoint.
- `simulateLoading` includes `insertHTMLWithScripts`, and fires a `DOMContentLoaded` event.
- `insertHTMLWithScripts` is like `.innerHTML`, but additionally executing any `<script>` tags.

### TypeScript usage

There is nothing particular to change to make storybook-django work with TypeScript. Just make sure to configure TypeScript to understand `.md` and `.html` files if you use those features – here is a sample `stories.d.ts` file:

```ts
declare module '*.md';
declare module '*.html';
```

### Advanced usage

`storybook-django` is still very experimental. Head over to [Discussions](https://github.com/torchbox/storybook-django/discussions) to share information about more advanced usage.

#### Storyshots supports

`storybook-django` is compatible with Storyshots, with two constraints since rendering happens with Django via an API:

1. We need a running Django server while the Storyshots test suite is running.
2. Components render asynchronously, so we need to make sure to test the final rendering _from Django_, rather than an intermediary state.

Getting a Django server up and running is as simple as starting it in the background ahead of running the test suite. Here is a [GitHub Actions example](https://github.com/torchbox/storybook-django/blob/main/.github/workflows/ci.yml#L48-L70):

```yaml
- run: source .venv/bin/activate && python manage.py runserver 0:8001 &
- run: npm run test
```

To check whether Django patterns have finished rendering, we use a `data-state="loaded"` attribute set by storybook-django when it first inserts the HTML into the DOM. Here is an [example of automated accessibility tests with Axe](https://github.com/torchbox/storybook-django/blob/main/demo/static_src/tests/storyshots.test.js):

```js
/**
 * @jest-environment jsdom
 */
import initStoryshots from '@storybook/addon-storyshots';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, waitFor } from '@testing-library/react';

expect.extend(toHaveNoViolations);

initStoryshots({
  suite: 'Storyshots smoke tests',
  configPath: 'demo/storybook',
  test: async ({ story }) => {
    const { container, queryAllByTestId } = render(story.render());

    const patterns = queryAllByTestId('storybook-django');

    if (patterns.length > 0) {
      await waitFor(
        () => expect(patterns.map((p) => p.dataset.state)).toContain('loaded'),
        { timeout: 10000 },
      );
    }

    const results = await axe(container, {
      // See https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md for a list of rules.
      // Try to only disable rules if strictly needed, alternatively also consider excluding stories from those tests
      // with the `storyshots` parameter: https://github.com/storybookjs/storybook/tree/master/addons/storyshots/storyshots-core#disable.
      rules: {
        // Disabled because stories are expected to be rendered outside of landmarks for testing.
        region: { enabled: false },
      },
    });

    expect(results).toHaveNoViolations();
  },
});
```

This example supports running Storyshots both for vanilla React and Django Templates components, hence why we only wait for stories to be loaded in some cases.

#### YAML for mock context and tags

A few of the stories in our demo project use YAML to store a pattern’s mock context and tags. This is largely a demonstration of compatibility with how [django-pattern-library](https://github.com/torchbox/django-pattern-library) works, and for most users defining context and tags with Storybook APIs is more suitable. There are a few cases where the YAML setup can help:

- There is currently no way to override context in _other templates_ via API calls. YAML files make this possible.
- Similarly there is no way to override tags in other templates – again made possible with YAML files.

## Where storybook-django is heading

See [torchbox/django-pattern-library#103 – Storybook prototype of the pattern library](https://github.com/torchbox/django-pattern-library/issues/103) for more context on this project, and to keep up with changes to it in relation with django-pattern-library.

## Contributing

See anything you like in here? Anything missing? We welcome all support, whether on bug reports, feature requests, code, design, reviews, tests, documentation, and more. Please have a look at our [contribution guidelines](CONTRIBUTING.md).

If you just want to set up the project on your own computer, the contribution guidelines also contain all of the setup commands.

## Credits

View the full list of [contributors](https://github.com/torchbox/storybook-django/graphs/contributors). [MIT](LICENSE) licensed.
