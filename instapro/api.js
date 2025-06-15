import { renderPostsPageComponent } from './components/posts-page-component.js'
import { tokenId } from './index.js'
import { renderStatusLikedPost } from './components/liked-post.js'

// Замени на свой, чтобы получить независимый от других набор данных.

/**
 * Загружает изображение в облако и возвращает URL загруженного изображения.
 * @param {File} file - Файл изображения для загрузки.
 * @returns {Promise<string>} - URL загруженного изображения.
 */
// "боевая" версия инстапро лежит в ключе prod
// https://wedev-api.sky.pro/api/v1/mpf/instapro
// const personalKey = 'prod'
const personalKey = 'mpf'
// const baseHost = 'https://webdev-hw-api.vercel.app'
const uploadImageEndpoint = 'https://wedev-api.sky.pro/api/upload/image'
const baseHost = `https://wedev-api.sky.pro`
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`
export let urlLoadingImage

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

export const addPost = async ({ token, description, urlLoadingImage }) => {
    try {
        // Проверяем, что изображение было загружено
        if (urlLoadingImage && urlLoadingImage.fileUrl) {
            const newImageUrl = urlLoadingImage.fileUrl // Получаем URL загруженного изображения

            console.log('Загруженный URL изображения:', newImageUrl) // Логируем URL загруженного изображения

            const post = {
                description,
                imageUrl: newImageUrl, // Используем загруженный URL
            }

            const response = await fetch(postsHost, {
                method: 'POST',
                headers: {
                    Authorization: token, // Используем токен для авторизации
                },
                body: JSON.stringify(post),
            })

            if (!response.ok) {
                throw new Error('Не удалось добавить пост')
            }

            return await response.json() // Возвращаем созданный пост
        } else {
            console.error('URL загруженного изображения не установлен.')
            throw new Error('Не выбрано изображение для добавления поста.')
        }
    } catch (error) {
        console.error('Ошибка при добавлении поста:', error)
        throw error // Прокидываем ошибку выше
    }
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
        console.log(response.json());
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
                urlLoadingImage = { fileUrl: data.fileUrl }
                console.log({ fileUrl: data.fileUrl })
                console.log(urlLoadingImage)

                return { fileUrl: data.fileUrl } // Возвращаем URL загруженного изображения
            } else {
                throw new Error('Не удалось получить URL загруженного изображения')
            }
        })
        .catch((error) => {
            console.error('Ошибка при загрузке изображения:', error)
            throw error // Прокидываем ошибку выше
        })
}

export const likedPost = async ({ tokenId, postId }) => {
    console.log('ID поста для лайка:', postId) // Дебаг: выводим ID поста
    console.log('Токен:', tokenId) // Дебаг: выводим токен

    try {
        // Проверяем, что токен и ID поста существуют
        if (tokenId && postId) {
            const response = await fetch(`${baseHost}/api/v1/${personalKey}/instapro/${postId}/like`, {
                method: 'POST',
                headers: {
                    // Убедитесь, что токен передается корректно
                    Authorization: `${tokenId}`, // Токен без "Bearer"
                },
            })

            // Проверяем успешность ответа
            if (!response.ok) {
                const errorMessage = await response.text() // Получаем текст ошибки
                throw new Error(`Ошибка: ${response.status} ${response.statusText} - ${errorMessage}`)
            }

            const data = await response.json() // Ожидаем результат в формате JSON
            console.log('Ответ от сервера:', data) // Выводим полученные данные в консоль

            // Обновляем интерфейс, передавая данные в функцию для отображения состояния лайка
            renderStatusLikedPost(data) // Передаем данные напрямую (без обертки в объект)
            return data // Возвращаем данные
        } else {
            throw new Error('Token или ID поста отсутствует') // Пользовательская ошибка
        }
    } catch (error) {
        console.error('Ошибка при лайке поста:', error)
        throw error // Прокидываем ошибку выше
    }
}

export const dislikedPost = async ({ tokenId, postId }) => {
    console.log('ID поста для дизлайка:', postId) // Дебаг: выводим ID поста
    console.log('Токен:', tokenId) // Дебаг: выводим токен

    try {
        if (tokenId && postId) {
            const response = await fetch(`${baseHost}/api/v1/${personalKey}/instapro/${postId}/dislike`, {
                method: 'POST',
                headers: {
                    Authorization: `${tokenId}`, // Токен без "Bearer"
                },
            })

            if (!response.ok) {
                const errorMessage = await response.text() // Получаем текст ошибки
                throw new Error(`Ошибка: ${response.status} ${response.statusText} - ${errorMessage}`)
            }

            const data = await response.json() // Ожидаем результат в формате JSON
            console.log('Ответ от сервера:', data) // Выводим полученные данные в консоль

            // Проверяем, есть ли данные о посте
            if (data && data.post) {
                return data // Возвращаем данные, если они корректные
            } else {
                throw new Error('Неверная структура данных') // Если данных нет, выбрасываем ошибку
            }
        } else {
            throw new Error('Token или ID поста отсутствует') // Пользовательская ошибка
        }
    } catch (error) {
        console.error('Ошибка при дизлайке поста:', error)
        throw error // Прокидываем ошибку выше
    }
}
export const getPostsUsers = async (userId) => {
    console.log(userId)
    console.log('Получение постов от сервера')
    try {
        const response = await fetch(`${baseHost}/api/v1/${personalKey}/instapro/user-posts/${userId}`, {
            method: 'GET',
        })

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`)
        }

        // Получение данных в формате JSON
        const posts = await response.json()
        console.log('Полученные посты:', posts) // Логируем ответ от сервера

        return posts // Возвращаем посты
    } catch (error) {
        console.error('Ошибка при получении постов пользователя:', error)
        return null // В случае ошибки возвращаем null
    }
}

export const deletePost = async (postId) => {
    console.log(postId);
    try {
        const response = await fetch(`${baseHost}/api/v1/${personalKey}/instapro/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `${tokenId}`, // Убедитесь, что добавляете токен авторизации
            },
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
        return result.result === 'ok'; // Возвращаем true, если удаление прошло успешно
    } catch (error) {
        console.error('Ошибка при удалении поста:', error);
        return false; // В случае ошибки возвращаем false
    }
};