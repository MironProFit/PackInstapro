import { renderHeaderComponent } from './header-component.js'
import { renderUploadImageComponent } from './upload-image-component.js'

export function renderAddPostPageComponent({ appEl, onAddPostClick, token }) {
    const render = () => {
        console.log('запуск рендера поста')

        // @TODO: Реализовать страницу добавления поста
        const appHtml = `
    <div class="page-container">
    <div class="header-container"></div>
    <div class="form-input">
         <h3 class="form-title">Добавить пост</h3>
    
    
    
    <div id="preview-container"></div>
    
    <label for="image-description" style="margin-top: 10px;">Описание изображения:</label>
    <textarea id="image-description" class="input" rows="4" style="width: 100%; margin-top: 5px"></textarea>
    
    <button class="button" id="add-button">Отправить</button>
    </div>
   
</div>
`

        appEl.innerHTML = appHtml

        renderHeaderComponent({
            element: document.querySelector('.header-container'),
        })
        const imageDescription = document.getElementById('image-description')
        const fileInputElement = document.getElementById('file-upload-input')
        const previewContainer = document.getElementById('preview-container')
        let imageUrl = ''

        // fileInputElement.addEventListener('change', (e) => {
        //     const file = e.target.files[0]
        //     if (file) {
        //         const reader = new FileReader()
        //         reader.onload = (e) => {
        //             const img = document.createElement('img')
        //             img.src = e.target.result
        //             img.style.maxWidth = '100%'
        //             img.style.marginTop = '10px'
        //             previewContainer.innerHTML = ''
        //             previewContainer.appendChild(img)
        //             imageUrl = e.target.result
        //         }
        //         reader.readAsDataURL(file)
        //     }
        // })

        if (previewContainer) {
            renderUploadImageComponent({
                element: previewContainer,
                onImageUrlChange(newImgUrl) {
                    imageUrl = newImgUrl
                },
            })
        }

        document.getElementById('add-button').addEventListener('click', () => {
            if (imageDescription.value === '' || !imageUrl) {
                alert('Заполните обязательные поля')
                return
            } else {
                onAddPostClick({
                    description: imageDescription.value, // Здесь можно добавить описание, если нужно

                    imageUrl: imageUrl, // Используем сохраненный URL изображения
                })
                console.log('кнопка нажата запуск onAddPostClick')
            }
        })
    }

    render()
}
