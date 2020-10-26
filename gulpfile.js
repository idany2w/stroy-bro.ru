const { src, dest, parallel, series, watch } = require("gulp"); // подключаем gulp
const browserSync = require("browser-sync").create();			// подключаем плагин лайв сервера Browser-Sync
const concat = require("gulp-concat");							// плагин объединения нескольких файлов в один
const uglify = require("gulp-uglify-es").default;				// сжатие js
const sass = require("gulp-sass");								// плагин для работы с css-препроцессорами sass и scss
const autoprefixer = require("gulp-autoprefixer");				// название плагина говорит само за себя
const cleancss = require("gulp-clean-css");						// сжатие, красота для css
const imagemin = require("gulp-imagemin");						// крутое и простое сжатие изображений
const newer = require("gulp-newer");							// проверяет новость файлов
const del = require("del");										// удалятор файлов
const gcmq = require("gulp-group-css-media-queries");			// объединение media запросов CSS
const rename = require("gulp-rename");							// переименовать файлы

const browsersList = "last 10 years";

const scss_src = [
    "app/scss/**/*.scss"
]
const css_src = [
    "app/css/**/*.css",
    "app/blocks/**/*.css",
    "!app/css/style.css",
    "!app/css/style.min.css",
]
const js_src = [
    "app/blocks/**/*.js",		
    "app/js/**/*.js",		
    "!app/js/script.js", 
    "!app/js/script.min.js"
]

function img() {
	return src("app/img/src/**/*")
		.pipe(newer("app/img/dist/"))
		.pipe(imagemin())
		.pipe(dest("app/img/dist/"));
}
function scss_blocks() {
	return src("app/blocks/**/*.scss")                                            //получаем файлы
		.pipe(sass({outputStyle: 'expanded'}))                      //компилируем sass/scss в css
		.pipe(dest("app/blocks/"));									//выгрузка по указанному пути
}
function scss() {
    return src(scss_src)
		.pipe(sass({outputStyle: 'expanded'}))                      //компилируем sass/scss в css
		.pipe(dest("app/css/"));									//выгрузка по указанному пути
}
function css(){
	return src(css_src)                                             //получаем файлы
		.pipe(autoprefixer({overrideBrowserslist: [browsersList]}))
        .pipe(concat("style.css"))								    //объединение всех стилей в один
		.pipe(dest("app/css/"))										//выгрузка по указанному пути
		.pipe(browserSync.stream())
		.pipe(gcmq())												//объединение media запросов CSS
        .pipe(
			cleancss({
				level: { 1: { specialComments: 0 } },				//полная минификация css
			})
		)
        .pipe(rename("style.min.css"))                              //выгружаем сжатый файл
        .pipe(dest("app/css/"))										//выгрузка по указанному пути
		.pipe(browserSync.stream());								//синхронизация браузера
}
function js() {
    return src(js_src)                  //получаем файлы
		.pipe(concat("script.js"))		//объедиение подключенных js файлов в один с указанным именем
		.pipe(dest("app/js/"))          //выгружаем несжатый файл
		.pipe(uglify())					//сжатие js файлов
		.pipe(rename("script.min.js"))	//выгружаем сжатый файл
		.pipe(dest("app/js/"))			//выгрузка по указанному пути
		.pipe(browserSync.stream());	//синхронизация браузера
}

function bs() {
	browserSync.init({
		server: {
			baseDir: "app/",			//корневая директория сервера
			index: "index.html",					//индексный файл
		},
		notify: true,								//всплывающее уведомление Browser-Sync
		online: true,								//свервер локально или по всей Wi-Fi сети?
	});
}
function build() {
	return src(
		[
			"app/css/**/*.min.css",
			"app/js/**/*.min.js",
			"app/img/dist/**/*",
			"app/index.html",
		],
		{
			base: "app",
		}
	).pipe(dest("dist"));
}
function github_page() {
	return src(
		[
			"app/css/**/*.min.css",
			"app/js/**/*.min.js",
			"app/img/dist/**/*",
			"app/index.html",
		],
		{
			base: "app",
		}
	).pipe(dest("docs"));
}
function clean_docs() {
	return del("docs", { force: true });
}
function clean_dist() {
	return del("dist/**/*", { force: true });
}
function startWatch() {
    //вочим стили
    watch(scss_src, scss);
    watch("app/blocks/**/*.scss", scss_blocks);
    watch(css_src, css);

    //вочим скрипты
    watch(js_src, js);

    //вочим картинки
	watch("app/img/src/**/*", img);							

    //вочим html	
	watch("app/**/*.html").on("change", browserSync.reload);	
}

exports.js = js;
exports.img = img;
exports.css = css;
exports.scss = scss;
exports.scss_blocks = scss_blocks;

exports.bs = bs;
exports.build = build;
exports.clean_dist = clean_dist;

exports.compile = series(scss_blocks, scss, css, img, js);
exports.build = series(clean_docs,scss_blocks, scss, css, img, js, build, github_page);
exports.default = parallel(clean_dist, scss_blocks, scss, css, img, js, bs, startWatch)