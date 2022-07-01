import postApi from './api/postApi'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

function createPostElement(post) {
  if (!post) return

  const postTemplate = document.querySelector('#postItemTemplate')
  if (!postTemplate) return

  const liElement = postTemplate.content.firstElementChild.cloneNode(true)
  if (!liElement) return

  const titleElement = liElement.querySelector('[data-id="title"]')
  if (titleElement) titleElement.textContent = post.title

  const descriptionElement = liElement.querySelector('[data-id="description"]')
  if (descriptionElement) descriptionElement.textContent = post.description

  const authorElement = liElement.querySelector('[data-id="author"]')
  if (authorElement) authorElement.textContent = post.author

  const imageElement = liElement.querySelector('[data-id="thumbnail"]')
  if (imageElement) imageElement.src = post.imageUrl

  const timeSpanElement = liElement.querySelector('[data-id="timeSpan"]')
  if (timeSpanElement) timeSpanElement.textContent = dayjs(post.updatedAt).fromNow()

  return liElement
}

function renderPostList(data) {
  if (!Array.isArray(data) || data.length === 0) return
  const ulElement = document.querySelector('#postList')
  if (!ulElement) return
  ulElement.textContent = ''
  data.forEach((post) => {
    const liElement = createPostElement(post)
    ulElement.appendChild(liElement)
  })
}

function renderPagination(pagination) {
  const ulPagination = document.querySelector('#postsPagination')
  if (!pagination || !ulPagination) return
  const { _page, _limit, _totalRows } = pagination
  const totalPages = Math.ceil(_totalRows / _limit)

  ulPagination.dataset.page = _page
  ulPagination.dataset.totalPages = totalPages

  if (_page <= 1) ulPagination.firstElementChild?.classList.add('disabled')
  else ulPagination.firstElementChild?.classList.remove('disabled')

  if (_page >= totalPages) ulPagination.lastElementChild?.classList.add('disabled')
  else ulPagination.lastElementChild?.classList.remove('disabled')
}

async function handleFilterChange(filterName, filterValue) {
  try {
    const url = new URL(window.location)

    url.searchParams.set(filterName, filterValue)
    history.pushState({}, '', url)
    const { data, pagination } = await postApi.getAll(url.searchParams)

    renderPostList(data)
    renderPagination(pagination)
  } catch (error) {
    console.log(error)
  }
}

function handlePrevClick(e) {
  e.preventDefault()
  const ulPagination = document.querySelector('#postsPagination')

  if (!ulPagination) return
  const page = Number.parseInt(ulPagination.dataset.page) || 1
  if (page <= 1) return

  handleFilterChange('_page', page - 1)
}

function handleNextClick(e) {
  e.preventDefault()

  const ulPagination = document.querySelector('#postsPagination')

  if (!ulPagination) return
  const page = Number.parseInt(ulPagination.dataset.page) || 1
  const totalPages = ulPagination.dataset.totalPages
  if (page >= totalPages) return

  handleFilterChange('_page', page + 1)
}

function init() {
  const ulPagination = document.querySelector('#postsPagination')
  if (!ulPagination) return

  const prevLink = ulPagination.firstElementChild?.firstElementChild
  if (prevLink) {
    prevLink.addEventListener('click', handlePrevClick)
  }

  const nextLink = ulPagination.lastElementChild?.lastElementChild

  if (nextLink) {
    nextLink.addEventListener('click', handleNextClick)
  }
}

function initUrl() {
  const url = new URL(window.location)

  if (!url.searchParams.get('_page')) url.searchParams.set('_page', 1)
  if (!url.searchParams.get('_limit')) url.searchParams.set('_limit', 6)

  history.pushState({}, '', url)
}

;(async () => {
  try {
    init()
    initUrl()
    const queryParams = new URLSearchParams(window.location.search)

    const { data, pagination } = await postApi.getAll(queryParams)

    renderPostList(data)
    renderPagination(pagination)
  } catch (error) {
    console.log(error)
  }
})()
