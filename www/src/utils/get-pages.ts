import { IElement, Window } from 'happy-dom'

import { escapeHTML } from './escape-html.js'
import agrume_workspace_package_json from '../../../package.json'
import { compiledContent } from '../../../README.md'

const content = compiledContent()

/**
 * @returns The pages of the README.
 */
export function getPages() {
  const window = new Window()
  const document = window.document
  // eslint-disable-next-line max-len
  // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
  document.body.innerHTML = content

  document.querySelectorAll('*').forEach(function (element) {
    element.childNodes.forEach(function (child) {
      // If it is a text, encode it.
      // eslint-disable-next-line functional/no-conditional-statements
      if (child.nodeType === 3) {
        // eslint-disable-next-line max-len
        // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
        child.textContent = escapeHTML(child.textContent)
      }

      return undefined
    })

    return undefined
  })

  document.querySelectorAll('a').forEach(function (element) {
    // eslint-disable-next-line functional/no-conditional-statements
    if (element.getAttribute('href')?.startsWith('./')) {
      element.setAttribute(
        'href',
        `${
          agrume_workspace_package_json.repository.url}/blob/main/${
          element.getAttribute('href')?.slice(2)}`,
      )
    }

    // eslint-disable-next-line functional/no-conditional-statements
    if (element.getAttribute('href')?.startsWith('http')) {
      // eslint-disable-next-line max-len
      // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
      element.setAttribute('target', '_blank')
    }

    if (
      element.getAttribute('href')?.startsWith('#') &&
      document.querySelector(`h2#${element.getAttribute('href')?.slice(1)}`)
      // eslint-disable-next-line functional/no-conditional-statements
    ) {
      // eslint-disable-next-line max-len
      // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
      element.setAttribute(
        'href',
        `/docs/${element.getAttribute('href')?.slice(1)}`,
      )
    }

    return undefined
  })

  const root = document.querySelector('h2').parentElement

  const pages = root.children.reduce(function (pages, child) {
    if (child.tagName.toUpperCase() === 'H2') {
      const title = child.textContent
      const id = child.id

      return [...pages, { title, id, description: '', content: [] }]
    }

    const page = pages.at(-1)

    if (page) {
      // eslint-disable-next-line functional/no-conditional-statements
      if (/^H\d$/.test(child.tagName.toUpperCase())) {
        // @ts-expect-error - tagName is read-only
        // eslint-disable-next-line max-len
        // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
        child.tagName = `h${Number.parseInt(child.tagName[1] ?? '') - 1}`
      }

      return [
        ...pages.slice(0, -1),
        {
          ...page,
          content: [...page.content, child],
          description: page.description || (
            child.textContent.length > 100
              ? `${child.textContent.slice(0, 100)}...`
              : child.textContent
          ),
        },
      ]
    }

    return pages
  }, [] as Page[])

  const pages_to_not_include = new Set(['license'])
  const filtered_pages = pages.filter(function (page) {
    return !pages_to_not_include.has(page.id)
  })

  return filtered_pages
}

interface Page {
  title: string
  id: string
  description: string
  content: IElement[]
}
