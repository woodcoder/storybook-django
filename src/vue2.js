import { renderPattern, simulateLoading } from './storybook-django'

const getTemplateName = (template, filename) =>
  template ||
  filename?.replace(/.+\/templates\//, '').replace(/\.stories\..+$/, '.html') ||
  'template-not-found'

export const DjangoPattern = {
  name: 'DjangoPattern',
  props: {
    element: {
      type: String,
      default: 'div'
    },
    template: {
      type: String
    },
    filename: {
      type: String
    },
    context: {
      type: Object,
      default: () => ({})
    },
    tags: {
      type: Object,
      default: () => ({})
    },
    endpoint: {
      type: String,
      default: '/pattern-library/api/v1/render-pattern'
    }
  },
  watch: {
    context: {
      immediate: true,
      handler (val) {
        this.getRenderedPattern()
      }
    }
  },
  methods: {
    async getRenderedPattern () {
      const templateName = getTemplateName(this.template, this.filename)

      try {
        const res = await renderPattern(this.endpoint, templateName, this.context, this.tags)
        const html = await res.text()
        simulateLoading(this.$refs.elt, html)
      } catch (err) {
        simulateLoading(this.$refs.elt, err)
      }
    }
  },
  render (createElement) {
    return createElement(this.element, {
      ref: 'elt'
    })
  }
}
