import { getPosts, uploadImage } from './api.js'
import { renderAddPostPageComponent } from './components/add-post-page-component.js'
import { renderAuthPageComponent } from './components/auth-page-component.js'
import { ADD_POSTS_PAGE, AUTH_PAGE, LOADING_PAGE, POSTS_PAGE, USER_POSTS_PAGE } from './routes.js'
import { renderPostsPageComponent } from './components/posts-page-component.js'
import { renderLoadingPageComponent } from './components/loading-page-component.js'
import { getUserFromLocalStorage, removeUserFromLocalStorage, saveUserToLocalStorage } from './helpers.js'

export let user = getUserFromLocalStorage()
export let page = null
export let posts = []

const getToken = () => {
    const token = user ? `Bearer ${user.token}` : undefined
    console.log(token);
    return token
}

export const logout = () => {
    user = null
    removeUserFromLocalStorage()
    goToPage(POSTS_PAGE)
}

/**яя
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
    if ([POSTS_PAGE, AUTH_PAGE, ADD_POSTS_PAGE, USER_POSTS_PAGE, LOADING_PAGE].includes(newPage)) {
        if (newPage === ADD_POSTS_PAGE) {
            /* Если пользователь не авторизован, то отправляем его на страницу авторизации перед добавлением поста */
            page = user ? ADD_POSTS_PAGE : AUTH_PAGE
            console.log('Начало работы')
            return renderApp()
        }

        if (newPage === POSTS_PAGE) {
            page = LOADING_PAGE
            renderApp()

            return getPosts({ token: getToken() })
                .then((newPosts) => {
                    page = POSTS_PAGE
                    posts = newPosts
                    renderApp()
                })
                .catch((error) => {
                    console.error(error)
                    goToPage(POSTS_PAGE)
                })
        }

        if (newPage === USER_POSTS_PAGE) {
            // @@TODO: реализовать получение постов юзера из API
            console.log('Открываю страницу пользователя: ', data.userId)
            page = USER_POSTS_PAGE
            posts = []
            return renderApp()
        }

        page = newPage
        renderApp()

        return
    }

    throw new Error('страницы не существует')
}

const renderApp = () => {
    console.log('запуск рендера')
    const appEl = document.getElementById('app')
    if (page === LOADING_PAGE) {
        return renderLoadingPageComponent({
            appEl,
            user,
            goToPage,
        })
    }

    if (page === AUTH_PAGE) {
        return renderAuthPageComponent({
            appEl,
            setUser: (newUser) => {
                user = newUser
                saveUserToLocalStorage(user)
                goToPage(POSTS_PAGE)
            },
            user,
            goToPage,
        })
    }

    if (page === ADD_POSTS_PAGE) {
        console.log('Перешли на страницу загрузки поста');
        return renderAddPostPageComponent({
            appEl,
            onAddPostClick({ description, imageUrl }) {
                // Вызываем функцию загрузки изображения
                uploadImage(imageUrl) // Здесь imageUrl должен быть файлом
                    .then((imageResponse) => {
                        // Предполагаем, что imageResponse возвращает объект с URL
                        const postData = {
                            description: description,
                            imageUrl: imageResponse, // Используем imageResponse непосредственно
                        };
    
                        // Добавляем пост через API
                        return addPostToApi(postData);
                    })
                    .then(() => {
                        console.log('Добавляю пост...', { description, imageUrl });
                        goToPage(POSTS_PAGE); // Переход на страницу постов
                    })
                    .catch((error) => {
                        console.error('Ошибка добавления поста', error); // Логируем ошибку
                    });
            },
        });
    }

    if (page === POSTS_PAGE) {
        return renderPostsPageComponent({
            appEl,
        })
    }

    if (page === USER_POSTS_PAGE) {
        // @TODO: реализовать страницу с фотографиями отдельного пользвателя
        appEl.innerHTML = 'Здесь будет страница фотографий пользователя'
        return
    }
}

goToPage(POSTS_PAGE)
