var gulp = require('gulp'), // Подключаем Gulp
	sass = require('gulp-sass'), //Подключаем Sass пакет
	browserSync = require('browser-sync'), // Подключаем Browser Sync
	concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
	cssnano = require('gulp-cssnano'), // Подключаем пает для минификации CSS
	rename = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del = require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin = require('gulp-imagemin'), // Подключааем библиотеку для работы с изображениями
	pngquant = require('pngquant'), // Подключаем для работы с png
	cache = require('gulp-cache'), // Подлкючаем библиотеку кеширования 
	autoprefix = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов

gulp.task('sass', function() { // Создаем таск Sass
	return gulp.src('src/sass/**/*.sass') // Берем источник
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-sass
		.pipe(autoprefix(['last 15 versions'],{cascade: true})) // Создаем префиксы
		.pipe(gulp.dest('src/css')) // Выгружаем результаты в папку src/css
		.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task ('browser-sync', function(){ // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { //Определяем парметры сервера
			baseDir: 'src' // Директория для сервера - src
		}, 
		notify: false // Отключаем уведомления
	});
});

gulp.task('scripts', function() {  // Создаем таск scripts для сборки всех .js файлов
	return gulp.src([ // Берем все необходимые библиотеки
			'src/libs/jquery/dist/jquery.min.js', // Берем jQuery
			'src/libs/magnific-popup/dist/jquery.magnific-popup.min.js', // Берем Magnific Popup
		])
	.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
	.pipe(uglify()) // Сжимаем  JS файлы
	.pipe(gulp.dest('src/js')); // Выгружаем в папку src/js
});

gulp.task('css-libs', ['sass'], function() { // Таск для создания отдельного минифицированного файла libs.min.css
	return gulp.src('src/css/libs.css') // Выбираем файл для минификации
	.pipe(cssnano()) // Сжимаем
	.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
	.pipe(gulp.dest('src/css')); // Выгружаем в папку src/css
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'] , function(){ // Таск наблюдения
	gulp.watch('src/sass/**/*.sass', ['sass']); // Наблюдение за sass файлами в папке sass
	gulp.watch('src/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('src/js/**/*.js', browserSync.reload); // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
	return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('src/img/**/*') // Берем все изображения из src
	.pipe(cache(imagemin({ // С кэшированием
		interlaced: true, 
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img')); // Выгружаем на продакшн
});

gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function(){

	var buildCss = gulp.src([ // Переносим библиотеки в продакшн
		'src/css/main.css',
		'src/css/libs.min.css',

		])
	.pipe(gulp.dest('dist/css'));

	var buildFonts = gulp.src('src/fonts/**/*') // Переносим шрифты в продакшн
	.pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('src/js/**/*') // Переносим скрипты в продакшн
	.pipe(gulp.dest('dist/js'));

	var buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшн
	.pipe(gulp.dest('dist')); 

});

gulp.task('clear', function(callback) {
	return cache.clearAll(); // Очищаем кэш
});

gulp.task('default', ['watch']); //Таск для запуска всех тасков, используемых при разработке