import { USER_POSTS_PAGE } from '../routes.js'
import { renderHeaderComponent } from './header-component.js'
import { posts, user, goToPage } from '../index.js'
import { getPostsUsers, deletePost } from '../api.js'
import { formatDistanceToNow } from 'date-fns'
import { af, ru } from 'date-fns/locale'
import { statusLikedPost } from './liked-post.js'
import { initializeThemeToggle } from './darkmode.js'

export function renderPostsPageComponent({ appEl }) {
    const appHtml = `
        <div class='modal' id='modal' style='display: none;'>
            <div class='modal-content'>
                <button class='close' id='close-modal' aria-label='Закрыть модальное окно'>&times;</button>
                <img id='modal-image' src='' alt='Модальное изображение'>
            </div>
        </div>
        <div class='page-container'>
            <div class='header-container'></div>
            <ul class='posts'></ul>
        </div>
    `
    appEl.innerHTML = appHtml

    // ----- Добавляем обработчики закрытия модального окна (один раз!) -----
    const modal = document.getElementById('modal')
    const closeModal = document.getElementById('close-modal')
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none'
    })
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none'
        }
    })

    const renderPostsFromApi = () => {
        const containerPosts = document.querySelector('.posts')
        containerPosts.innerHTML = ''

        posts.forEach((post) => {
            const listEl = document.createElement('li')
            listEl.classList.add('post')
            const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru })

            listEl.innerHTML = `
                <div class='post-header' data-user-id='${post.user.id}'>
                    <img src='${post.user.imageUrl}' class='post-header__user-image' alt='${post.user.name}'>
                    <p class='post-header__user-name'>${post.user.name}</p>
                </div>
                <div class='post-image-container'>
                    <img class='post-image' src='${post.imageUrl}' alt='Пост изображение'>
                </div>
                <div class='post-likes'>
                    <button data-post-id='${post.id}' class='like-button'>
                        <img src='./assets/images/${post.isLiked ? 'like-active' : 'like-not-active'}.svg' alt='Лайк'>
                    </button>
                    <p class='post-likes-text'>Нравится: <strong>${post.likes.length}</strong></p>
                </div>
                <p class='post-text'>${post.description}</p>
                <p class='post-date'>${formattedDate}</p>
            `

            // ---- Открытие модального окна (по клику на картинку) ----
            const postImage = listEl.querySelector('.post-image')
            postImage.addEventListener('click', () => {
                const modalImage = document.getElementById('modal-image')
                modalImage.src = post.imageUrl
                modal.style.display = 'block'
            })

            // ---- Кнопка удаления, если автор ----
            const storedUserData = localStorage.getItem('user')
            if (storedUserData) {
                const currentUser = JSON.parse(storedUserData)
                const currentUserId = currentUser._id
                if (post.user.id === currentUserId) {
                    const deleteButton = document.createElement('button')
                    deleteButton.classList.add('button-delete', 'button')
                    deleteButton.dataset.postId = post.id
                    deleteButton.textContent = 'Удалить'
                    deleteButton.addEventListener('click', async () => {
                        const confirmDelete = confirm('Вы уверены, что хотите удалить этот пост?')
                        if (confirmDelete) {
                            const result = await deletePost(post.id)
                            if (result) {
                                listEl.remove()
                                console.log('Пост удален')
                            } else {
                                console.error('Ошибка при удалении поста')
                            }
                        }
                    })
                    listEl.appendChild(deleteButton)
                }
            }

            containerPosts.appendChild(listEl)
        })
    }

    renderPostsFromApi()

    renderHeaderComponent({
        element: document.querySelector('.header-container'),
    })

    // ----- Переход к постам по пользователю -----
    const postsContainer = document.querySelector('.posts')
    if (postsContainer) {
        postsContainer.addEventListener('click', (event) => {
            const userEl = event.target.closest('.post-header')
            if (userEl) {
                const userId = userEl.dataset.userId
                if (userId) {
                    goToPage(USER_POSTS_PAGE, { userId: userId })
                    console.log('Переход к постам пользователя с ID:', userId)
                }
            }
        })
    }

    statusLikedPost()
    initializeThemeToggle()
}

export function renderUserPostsPageComponent({ appEl, userId }) {
    const appHtml = `
        <div class='modal' id='modal' style='display: none;'>
            <div class='modal-content'>
                <button class='close' id='close-modal' aria-label='Закрыть модальное окно'>&times;</button>
                <img id='modal-image' src='' alt='Модальное изображение'>
            </div>
        </div>
        <div class='page-container'>
            <div class='header-container'></div>
            <ul class='posts'></ul>
        </div>
    `
    appEl.innerHTML = appHtml

    const modal = document.getElementById('modal')
    const closeModal = document.getElementById('close-modal')
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none'
    })
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none'
        }
    })

    async function renderPostsFromApi() {
        const containerPosts = document.querySelector('.posts')
        const currentUser = JSON.parse(localStorage.getItem('user'))
        const currentUserId = currentUser?._id

        // Получаем посты пользователя
        const response = await getPostsUsers(userId)
        const posts = response.posts || response
        console.log(posts)

        if (!Array.isArray(posts) || posts.length === 0) {
            containerPosts.innerHTML = `<p>Посты не найдены.</p>`
            return
        }

        containerPosts.innerHTML = ''
        posts.forEach((post) => {
            const isLikedByCurrentUser = post.likes.some((like) => like._id === currentUserId)
            console.log(isLikedByCurrentUser)

            const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: ru,
            })

            const listEl = document.createElement('li')
            listEl.classList.add('post')

            listEl.innerHTML = `
                <div class='post-header' data-user-id='${post.user.id}'>
                    <img src='${post.user.imageUrl}' class='post-header__user-image' alt='${post.user.name}'>
                    <p class='post-header__user-name'>${post.user.name}</p>
                </div>
                <div class='post-image-container'>
                    <img class='post-image' src='${post.imageUrl}' alt='Пост изображение'>
                </div>
                <div class='post-likes'>
                    <button data-post-id='${post.id}' class='like-button'>
                        <img src='./assets/images/${isLikedByCurrentUser ? 'like-active' : 'like-not-active'}.svg' alt='Лайк'>
                    </button>
                    <p class='post-likes-text'>Нравится: <strong>${post.likes.length}</strong></p>
                </div>
                <p class='post-text'>${post.description}</p>
                <p class='post-date'>${formattedDate}</p>
            `

            // Открытие модалки
            const postImage = listEl.querySelector('.post-image')
            postImage.addEventListener('click', () => {
                document.getElementById('modal-image').src = post.imageUrl
                modal.style.display = 'block'
            })

          

            listEl.querySelector('.like-button').addEventListener('click', async () => {
                await statusLikedPost(post.id) // нужно чтобы эта функция обновляла сервер и возвращала новое состояние
                // await renderPosts() // перерендер для обновления лайка
            })

            // Переход на пользователя
            listEl.querySelector('.post-header').addEventListener('click', () => {
                goToPage(USER_POSTS_PAGE, { userId: post.user.id })
            })

            containerPosts.appendChild(listEl)
        })
    }

    renderHeaderComponent({
        element: document.querySelector('.header-container'),
    })

    renderPostsFromApi()
    initializeThemeToggle()
    // statusLikedPost()
}
