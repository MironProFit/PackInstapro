import { USER_POSTS_PAGE } from '../routes.js'
import { renderHeaderComponent } from './header-component.js'
import { posts, user, goToPage } from '../index.js'
import { getPostsUsers, deletePost } from '../api.js' // Убедитесь, что импортируете getPostsUsers
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { statusLikedPost } from './liked-post.js'

export function renderPostsPageComponent({ appEl }) {
    const appHtml = `<div class='page-container'>
            <div class='header-container'></div>
            <ul class='posts'></ul>
        </div>
    `

    appEl.innerHTML = appHtml

    const renderPostsFromApi = () => {
        const containerPosts = document.querySelector('.posts')
        containerPosts.innerHTML = '' // Очищаем контейнер перед добавлением новых постов

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
                    <p class='post-likes-text'>
                        Нравится: <strong>${post.likes.length}</strong>
                    </p>
                </div>
                <p class='post-text'>${post.description}</p>
                <p class='post-date'>${formattedDate}</p>
                
            `

            // Проверяем, является ли текущий пользователь автором поста
            console.log(post.user.id) // ID пользователя, который выложил пост

            // Получаем данные текущего пользователя из localStorage
            const storedUserData = localStorage.getItem('user')
            if (storedUserData) {
                // Парсим данные из JSON и получаем объект пользователя
                const currentUser = JSON.parse(storedUserData)
                const currentUserId = currentUser._id // Получаем ID текущего пользователя
                console.log('Current User ID:', currentUserId)
            }

            console.log('Stored User Data:', storedUserData) // Логируем данные, сохраненные в localStorage
            // console.log(user._id)
            // console.log(post.user.id === user._id);
            // if (post.user.id === user._id) {
            //     // Добавляем кнопку удаления только для своих постов
            //     const deleteButton = document.createElement('button')
            //     deleteButton.classList.add('button-delete')
            //     deleteButton.dataset.postId = post.id
            //     deleteButton.textContent = 'Удалить'

            //     // Добавляем обработчик события для кнопки удаления
            //     deleteButton.addEventListener('click', async () => {
            //         const confirmDelete = confirm('Вы уверены, что хотите удалить этот пост?')
            //         if (confirmDelete) {
            //             const result = await deletePost(post.id) // Функция для удаления поста
            //             if (result) {
            //                 listEl.remove() // Удаляем элемент поста из DOM
            //                 console.log('Пост удален')
            //             } else {
            //                 console.error('Ошибка при удалении поста')
            //             }
            //         }
            //     })

            //     listEl.appendChild(deleteButton) // Добавляем кнопку удаления под постом
            // }

            // Добавляем элемент поста в контейнер
            containerPosts.appendChild(listEl)
        })
    }

    renderPostsFromApi()

    renderHeaderComponent({
        element: document.querySelector('.header-container'),
    })

    // Обработчик для перехода к постам пользователя
    const postsContainer = document.querySelector('.posts')
    if (postsContainer) {
        postsContainer.addEventListener('click', (event) => {
            const userEl = event.target.closest('.post-header') // Находим ближайший .post-header
            if (userEl) {
                const userId = userEl.dataset.userId
                if (userId) {
                    goToPage(USER_POSTS_PAGE, { userId: userId })
                    console.log('Переход к постам пользователя с ID:', userId)
                }
            }
        })
    }

    // Обновляем состояние лайков
    statusLikedPost()
}

export function renderUserPostsPageComponent({ appEl, userId }) {
    console.log('Рендер постов отдельного пользователя')
    console.log(userId)

    const renderPostsFromApi = async () => {
        const containerPosts = document.querySelector('.posts') // Получаем контейнер постов

        // Получаем посты пользователя
        const response = await getPostsUsers(userId) // Получаем посты
        console.log({ response })

        const posts = response.posts // Извлекаем массив постов
        console.log({ posts })

        // Проверяем, является ли posts массивом
        if (!Array.isArray(posts) || posts.length === 0) {
            containerPosts.innerHTML = `<p>Посты не найдены.</p>`
            return
        }

        // Очищаем контейнер перед добавлением новых постов
        containerPosts.innerHTML = ''

        posts.forEach((post) => {
            const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru })

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
                        <img src='./assets/images/${post.isLiked ? 'like-active' : 'like-not-active'}.svg'>
                    </button>
                    <p class='post-likes-text'>
                        Нравится: <strong>${post.likes.length}</strong>
                    </p>
                </div>
                <p class='post-text'>
                    ${post.description}
                </p>
                <p class='post-date'>${formattedDate}</p>
                <button class='button-delete button' data-post-id='${post.id}'>Удалить</button>
            `

            // Добавляем обработчик события для кнопки удаления
            const deleteButton = listEl.querySelector('.button-delete')
            deleteButton.addEventListener('click', async () => {
                const confirmDelete = confirm('Вы уверены, что хотите удалить этот пост?')
                if (confirmDelete) {
                    const result = await deletePost(post.id) // Удаление поста
                    if (result) {
                        // Успешное удаление, обновляем интерфейс
                        listEl.remove() // Удаляем элемент поста из DOM
                        console.log('Пост удален')
                    } else {
                        console.error('Ошибка при удалении поста')
                    }
                }
            })

            // Добавляем элемент поста в контейнер
            containerPosts.appendChild(listEl)
        })
    }

    renderHeaderComponent({
        element: document.querySelector('.header-container'),
    })

    renderPostsFromApi() // Вызываем функцию рендеринга
    statusLikedPost() // Обновляем состояние лайков
}
