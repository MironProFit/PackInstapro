const path = require('path')

module.exports = {
    mode: 'development',
    entry: './instapro/index.js', // Входной файл
    output: {
        filename: 'main.js', // Выходной файл
        path: path.resolve(__dirname+'/instapro', 'dist'), // Путь к выходной папке
    },
    // stats: {
    //     all: true, // Показывать только необходимые данные
    //     errors: true,
    //     warnings: true,
    //     errorDetails: true, // Показывать детали ошибок
    //     moduleTrace: true, // Показывать трассировки модулей
    //   },
    

    devtool: 'source-map', // Добавляет поддержку source maps
}
