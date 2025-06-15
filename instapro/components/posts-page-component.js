import { USER_POSTS_PAGE } from '../routes.js'
import { renderHeaderComponent } from './header-component.js'
import { posts, goToPage, user } from '../index.js'
import { getAllPosts, getPostsUsers, getUserData } from '../api.js'
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
            console.log(post)
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
                        <img src="./assets/images/${post.isLiked ? 'like-active' : 'like-not-active'}.svg">
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

    const postsContainer = document.querySelector('.posts') //  Предполагаем, что посты находятся в .posts
    if (postsContainer) {
        console.log(postsContainer)
        postsContainer.addEventListener('click', (event) => {
            const userEl = event.target.closest('.post-header') // Находим ближайший .post-header
            if (userEl) {
                const userId = userEl.dataset.userId
                if (userId) {
                    goToPage(USER_POSTS_PAGE, { userId: userId })
                    console.log(userId)
                }
            }
        })
    }

    statusLikedPost()
}
export function renderUserPostsPageComponent({ appEl, userId }) {
    console.log('Рендер постов отдельного пользователя');
    console.log(userId);

    const renderPostsFromApi = async () => {
        const containerPosts = document.querySelector('.posts'); // Получаем контейнер постов
        console.log(containerPosts);

        // Получаем посты пользователя
        const response = await getPostsUsers(userId); // Получаем посты
        console.log({ response });

        const posts = response.posts; // Извлекаем массив постов
        console.log({ posts });

        // Проверяем, является ли posts массивом
        if (!Array.isArray(posts) || posts.length === 0) {
            containerPosts.innerHTML = `<p>Посты не найдены.</p>`;
            return;
        }

        // Очищаем контейнер перед добавлением новых постов
        containerPosts.innerHTML = '';

        posts.forEach((post) => {
            const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru });

            const listEl = document.createElement('li');
            listEl.classList.add('post');

            listEl.innerHTML = `
                <div class='post-header' data-user-id='${post.user.id}' class='post-header'>
                    <img src='${post.user.imageUrl}' class='post-header__user-image' alt='${post.user.name}' data-user-id='${post.user.id}'>
                    <p class='post-header__user-name' data-user-id='${post.user.id}'>${post.user.name}</p>
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
            `;

            // Добавляем обработчик событий на имя пользователя и аватарку
            const userNameElement = listEl.querySelector('.post-header__user-name');
            const userImageElement = listEl.querySelector('.post-header__user-image');

            userNameElement.addEventListener('click', () => {
                renderUserPostsPageComponent({ appEl, userId: post.user.id });
            });

            userImageElement.addEventListener('click', () => {
                renderUserPostsPageComponent({ appEl, userId: post.user.id });
            });

            containerPosts.appendChild(listEl); // Добавляем пост в контейнер
        });
    };

    renderHeaderComponent({
        element: document.querySelector('.header-container'),
    });

    renderPostsFromApi(); // Вызываем функцию рендеринга
    statusLikedPost(); // Обновляем состояние лайков
}