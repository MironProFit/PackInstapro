import { likedPost } from '../api.js'
import { tokenId } from '../index.js'

export const statusLikedPost = () => {
    console.log('Запуск функции отслеживания лайка')
    const likeButtons = document.querySelectorAll('.like-button')
    likeButtons.forEach((button) => {
        button.addEventListener('click', async (e) => {
            const postId = e.currentTarget.getAttribute('data-post-id')

            try {
                // Отправляем запрос на лайк поста
                const result = await likedPost({ tokenId, postId })

                // Обновляем текст количества лайков
                const likesText = e.currentTarget.nextElementSibling.querySelector('strong')
                likesText.textContent = result.post.likes.length // Обновляем количество лайков
            } catch (error) {
                console.error('Ошибка при лайке поста:', error)
            }
        })
    })
}

export const renderStatusLikedPost = ({data}) => {
    console.log(data);
}
