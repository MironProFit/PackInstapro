import { USER_POSTS_PAGE } from '../routes.js'
import { renderHeaderComponent } from './header-component.js'
import { posts, goToPage } from '../index.js'
import { getAllPosts } from '../api.js'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { statusLikedPost } from './liked-post.js'

export function renderPostsPageComponent({ appEl }) {
    // console.log(appEl);
    const appHtml = `
        <div class="page-container">
            <div class="header-container"></div>
            <ul class="posts"></ul>
        </div>
    `

    appEl.innerHTML = appHtml

    const renderPostsFromApi = () => {
        const containerPosts = document.querySelector('.posts')
        posts.forEach((post) => {
            const listEl = document.createElement('li')
            listEl.classList.add('post')
            const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru })
            // console.log(formattedDate)

            listEl.innerHTML = `
                <div class="post-header" data-user-id="${post.user.id}">
                    <img src="${post.user.imageUrl}" class="post-header__user-image">
                    <p class="post-header__user-name">${post.user.name}</p>
                </div>
                <div class="post-image-container">
                    <img class="post-image" src="${post.imageUrl}">
                </div>
                <div class="post-likes">
                    <button data-post-id="${post.id}" class="like-button">
                        <img src="./assets/images/like-active.svg">
                    </button>
                    <p class="post-likes-text">
                        Нравится: <strong>${post.likes.length}</strong>
                    </p>
                </div>
                <p class="post-text">
                    <span class="user-name">${post.user.name}</span>
                    ${post.description}
                </p>
                <p class="post-date">${formattedDate}</p>
            `
            // console.log(post.createdAt)
            containerPosts.appendChild(listEl)
        })
    }

    renderPostsFromApi()
    document.addEventListener('DOMContentLoaded', () => {
        statusLikedPost() // Вызываем функцию после загрузки DOM
    })

    renderHeaderComponent({
        element: document.querySelector('.header-container'),
    })

    document.querySelectorAll('.post-header').forEach((userEl) => {
        userEl.addEventListener('click', () => {
            goToPage(USER_POSTS_PAGE, {
                userId: userEl.dataset.userId,
            })
        })
    })
    statusLikedPost()
}
