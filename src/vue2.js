import { renderPattern, simulateLoading } from './storybook-django';

const getTemplateName = (template, filename) => {
  if (template) {
    return template;
  }

  if (filename) {
    return filename
      .replace(/.+\/templates\//, '')
      .replace(/\.stories\..+$/, '.html')
      .toLowerCase();
  }

  return 'Template not found!';
};

export const DjangoPattern = {
  name: 'DjangoPattern',
  props: {
    element: {
      type: String,
      default: 'div',
    },
    template: {
      type: String,
    },
    filename: {
      type: String,
    },
    context: {
      type: Object,
      default: () => ({}),
    },
    tags: {
      type: Object,
      default: () => ({}),
    },
    endpoint: {
      type: String,
      default: '/pattern-library/api/v1/render-pattern',
    }
  },
  watch: {
    context: {
      deep: true,
      immediate: true,
      async handler (val) {
        const templateName = getTemplateName(this.template, this.filename);

        try {
          const res = await renderPattern(this.endpoint, templateName, this.context, this.tags);
          const html = await res.text();
          simulateLoading(this.$refs.elt, html);
        } catch (err) {
          simulateLoading(this.$refs.elt, err);
        }
      },
    }
  },
  render (createElement) {
    return createElement(this.element, {
      ref: 'elt',
    });
  }
};
