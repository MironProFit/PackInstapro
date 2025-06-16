import { getPosts, addPost, urlLoadingImage, getPostsUsers } from './api.js'
import { statusLikedPost } from './components/liked-post.js'
import { renderAddPostPageComponent } from './components/add-post-page-component.js'
import { renderAuthPageComponent } from './components/auth-page-component.js'
import { ADD_POSTS_PAGE, AUTH_PAGE, LOADING_PAGE, POSTS_PAGE, USER_POSTS_PAGE } from './routes.js'
import { renderPostsPageComponent, renderUserPostsPageComponent } from './components/posts-page-component.js'
import { renderLoadingPageComponent } from './components/loading-page-component.js'
import { getUserFromLocalStorage, removeUserFromLocalStorage, saveUserToLocalStorage } from './helpers.js'
import { initializeThemeToggle } from './components/darkmode.js'

export let user = getUserFromLocalStorage()
export let page = null
export let posts = []
export let tokenId = ''

const getToken = () => {
    const token = user ? `Bearer ${user.token}` : undefined
    console.log(token)
    tokenId = token
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
            renderApp()
            initializeThemeToggle()
            return
        }

        if (newPage === POSTS_PAGE) {
            page = LOADING_PAGE
            renderApp()
            initializeThemeToggle()

            return getPosts({ token: getToken() })
                .then((newPosts) => {
                    page = POSTS_PAGE
                    posts = newPosts
                    renderApp()
                    initializeThemeToggle()
                })
                .catch((error) => {
                    console.error(error)
                    goToPage(POSTS_PAGE)
                })
        }

        if (newPage === USER_POSTS_PAGE) {
            const userId = data.userId // Извлекаем userId
            if (userId) {
                console.log(userId)
                try {
                    const appEl = document.getElementById('app')
                    renderUserPostsPageComponent({ appEl, userId }) // Передаем appEl и userId
                } catch (error) {
                    console.error('Ошибка при рендеринге страницы постов пользователя:', error)
                }
            } else {
                console.error('Не указан userId')
            }
            return // Завершаем выполнение функции
        }

        page = newPage
        renderApp()
        initializeThemeToggle()
        return
    }

    throw new Error('страницы не существует')
}

const renderApp = () => {
    console.log('запуск рендера')
    const appEl = document.getElementById('app')
    if (page === LOADING_PAGE) {
        renderLoadingPageComponent({
            appEl,
            user,
            goToPage,
        })
        initializeThemeToggle()

        return
    }

    if (page === AUTH_PAGE) {
        renderAuthPageComponent({
            appEl,
            setUser: (newUser) => {
                user = newUser
                saveUserToLocalStorage(user)
                goToPage(POSTS_PAGE)
            },
            user,
            goToPage,
        })
        initializeThemeToggle()

        return
    }

    if (page === ADD_POSTS_PAGE) {
        console.log(page)
        console.log('Перешли на страницу загрузки поста')
        initializeThemeToggle()

        renderAddPostPageComponent({
            appEl,
            onAddPostClick: async ({ description }) => {
                try {
                    console.log(urlLoadingImage)
                    const token = getToken() // Получаем токен

                    // Проверяем, выбран ли файл
                    if (!urlLoadingImage || !urlLoadingImage.fileUrl) {
                        alert('Пожалуйста, выберите файл для загрузки.')
                        return // Не продолжать, если файл не выбран
                    }

                    // Добавляем новый пост
                    const newPost = await addPost({ token, description, urlLoadingImage })
                    posts.push(newPost) // Добавляем новый пост в массив постов
                    goToPage(POSTS_PAGE) // Переходим на страницу постов
                    console.log('Добавляю пост')
                } catch (err) {
                    console.error('Ошибка при добавлении поста:', err) // Логируем ошибку
                    alert('Не удалось добавить пост. Попробуйте еще раз.') // Отображаем сообщение пользователю
                }
            },
        })
        initializeThemeToggle()

        return
    }

    if (page === POSTS_PAGE) {
        renderPostsPageComponent({
            appEl,
        })
        initializeThemeToggle()
        return
    }

    if (page === USER_POSTS_PAGE) {
        renderUserPostsPageComponent({ appEl })
        initializeThemeToggle()

        // @TODO: реализовать страницу с фотографиями отдельного пользвателя
        // appEl.innerHTML = 'Здесь будет страница фотографий пользователя'
        return
    }
}

goToPage(POSTS_PAGE)
initializeThemeToggle()
