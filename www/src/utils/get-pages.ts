import type { IElement } from 'happy-dom'
import { Window } from 'happy-dom'

import packageJson from '../../../package.json'
import { compiledContent } from '../../../README.md'
import { escapeHTML } from './escape-html.js'

const content = compiledContent()

/**
 * Get pages of the README.
 */
export function getPages() {
  const window = new Window()
  const document = window.document

  document.body.innerHTML = content

  document.querySelectorAll('*').forEach((element) => {
    element.childNodes.forEach((child) => {
      // If it is a text, encode it.
      if (child.nodeType === 3) {
        child.textContent = escapeHTML(child.textContent)
      }

      return undefined
    })

    return undefined
  })

  document.querySelectorAll('a').forEach((element) => {
    const href = element.getAttribute('href')

    if (!href) {
      return
    }

    if (href.startsWith('./')) {
      element.setAttribute(
        'href',
        `${packageJson.repository.url}/blob/main/${element.getAttribute('href')?.slice(2)}`,
      )
    }

    if (href.startsWith('http')) {
      element.setAttribute('target', '_blank')
    }

    if (
      href.startsWith('#')
      && document.querySelector(`h2#${element.getAttribute('href')?.slice(1)}`)
    ) {
      element.setAttribute(
        'href',
        `/docs/${element.getAttribute('href')?.slice(1)}`,
      )
    }
  })

  const root = document.querySelector('h2').parentElement

  const pages = root.children.reduce((pages, child) => {
    if (child.tagName.toUpperCase() === 'H2') {
      const title = child.textContent
      const id = child.id

      return [...pages, { content: [], description: '', id, title }]
    }

    const page = pages.at(-1)

    if (page) {
      if (/^H\d$/.test(child.tagName.toUpperCase())) {
        // @ts-expect-error - tagName is read-only
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

  const pagesToNotInclude = new Set(['license'])
  const filteredPages = pages.filter((page) => {
    return !pagesToNotInclude.has(page.id)
  })

  return filteredPages
}

interface Page {
  content: IElement[]
  description: string
  id: string
  title: string
}
