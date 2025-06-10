import { renderPostsPageComponent } from './components/posts-page-component.js'

// Замени на свой, чтобы получить независимый от других набор данных.

/**
 * Загружает изображение в облако и возвращает URL загруженного изображения.
 * @param {File} file - Файл изображения для загрузки.
 * @returns {Promise<string>} - URL загруженного изображения.
 */
// "боевая" версия инстапро лежит в ключе prod

// const personalKey = 'prod'
const personalKey = 'mpf'
// const baseHost = 'https://webdev-hw-api.vercel.app'
const uploadImageEndpoint = 'https://wedev-api.sky.pro/api/upload/image'
const baseHost = `https://wedev-api.sky.pro`
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`

export function getAllPosts() {
    return fetch(postsHost)
        .then((response) => {
            // throw new Error('проверка')

            return response.json()
        })
        .then((responseData) => {
            console.log(responseData)
            renderPostsPageComponent()
            const commentsApi = responseData
            return commentsApi
        })
        .catch((error) => console.error(error.message))
}

export function getPosts({ token }) {
    return fetch(postsHost, {
        method: 'GET',
        headers: {
            Authorization: token,
        },
    })
        .then((response) => {
            if (response.status === 401) {
                throw new Error('Нет авторизации')
            }

            return response.json()
        })
        .then((data) => {
            return data.posts
        })
}

export function registerUser({ login, password, name, imageUrl }) {
    return fetch(baseHost + '/api/user', {
        method: 'POST',
        body: JSON.stringify({
            login,
            password,
            name,
            imageUrl,
        }),
    }).then((response) => {
        if (response.status === 400) {
            throw new Error('Такой пользователь уже существует')
        }
        return response.json()
    })
}

export function loginUser({ login, password }) {
    return fetch(baseHost + '/api/user/login', {
        method: 'POST',
        body: JSON.stringify({
            login,
            password,
        }),
    }).then((response) => {
        if (response.status === 400) {
            throw new Error('Неверный логин или пароль')
        }
        return response.json()
    })
}

export function uploadImage({ file }) {
    console.log('Запуск загрузки изображения')

    const data = new FormData()
    data.append('file', file)

    return fetch(uploadImageEndpoint, {
        method: 'POST',
        body: data,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Сеть ответила с ошибкой ' + response.status)
            }
            return response.json()
        })
        .then((data) => {
            if (data.fileUrl) {
                console.log('Изображение загружено:', data.fileUrl) // Выводим URL загруженной картинки
                return data.fileUrl // Возвращаем URL загруженного изображения
            } else {
                throw new Error('Не удалось получить URL загруженного изображения')
            }
        })
        .catch((error) => {
            console.error('Ошибка при загрузке изображения:', error)
            throw error // Прокидываем ошибку выше
        })
}
