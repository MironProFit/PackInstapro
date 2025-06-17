import { uploadImage} from '../api.js'

export function renderUploadImageComponent({ element, onImageUrlChange }) {
  let imageUrl = ''

  const render = () => {
      element.innerHTML = `
    <div class='upload-image'>
      ${
          imageUrl
              ? `
          <div class='file-upload-image-container'>
            <img class='file-upload-image' src='${imageUrl}' alt='Загруженное изображение'>
            <button class='file-upload-remove-button button'>Заменить фото</button>
          </div>
          `
              : `
          <label id='image-input' class='file-upload-label secondary-button'>
            <input
              type='file'
              class='file-upload-input'
              style='display:none'
              accept='image/*'
            />
            Выберите фото
          </label>
        `
      }
    </div>
  `

      const fileInputElement = element.querySelector('.file-upload-input')
      fileInputElement?.addEventListener('change', () => {
          const file = fileInputElement.files[0]
          if (file) {
              const labelEl = document.getElementById('image-input')
              labelEl.setAttribute('disabled', true)
              labelEl.textContent = 'Загружаю файл...'

              uploadImage({ file }).then(({ fileUrl }) => {
                  imageUrl = fileUrl
                  console.log(imageUrl)
                  onImageUrlChange(imageUrl)
                  render()
              }).catch(error => {
                  console.error('Ошибка загрузки изображения:', error)
                  labelEl.removeAttribute('disabled')
                  labelEl.textContent = 'Выберите фото'
                  imageUrl = ''

              })
          }
      })

      const removeButton = element.querySelector('.file-upload-remove-button')
      removeButton?.addEventListener('click', () => {
          imageUrl = ''
          onImageUrlChange(imageUrl)
          render()
      })
  }

  render()

  // Возвращаем объект с fileInputElement
  return {
      fileInputElement: element.querySelector('.file-upload-input') // Теперь мы правильно возвращаем fileInputElement
  }
}