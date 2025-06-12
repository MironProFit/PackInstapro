import { likedPost } from '../api.js'
import { tokenId } from '../index.js'

export const statusLikedPost = () => {
    console.log('Запуск функции отслеживания лайка')
    console.log(tokenId)

    const likeButtons = document.querySelectorAll('.like-button')
    likeButtons.forEach((button) => {
        console.log('Кнопка лайка найдена')
        button.addEventListener('click', async (e) => {
            if (tokenId) {
                // Проверка на наличие токена
                const postId = e.currentTarget.getAttribute('data-post-id')
                console.log('ID поста:', postId)

                try {
                    const result = await likedPost({ tokenId,postId }) // Передача объекта
                    console.log('Лайк успешно отправлен:', result)
                } catch (error) {
                    console.error('Ошибка при лайке поста:', error.message)
                }
            } else {
                console.warn('Токен не найден. Лайк не может быть отправлен.')
            }
        })
    })
}
