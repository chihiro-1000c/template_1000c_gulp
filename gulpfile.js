// gulp本体の機能を分割代入
const { src, dest, watch, series, parallel } = require("gulp");
const loadPlugins = require("gulp-load-plugins");
const $ = loadPlugins();

const autoprefixer = require("autoprefixer");
const del = require("del");
const browserSync = require("browser-sync");
const fs = require("fs");

// 入出力するフォルダを指定
const srcBase = "./src";
const distBase = "./dist";

const srcPath = {
  scss: srcBase + "/asset/sass/**/*.scss",
  js: srcBase + "/asset/js/**/*.js",
  img: srcBase + "/asset/img/**",
  html: srcBase + "/**/*.html",
  ejs: [srcBase + "/**/*.ejs", "!" + srcBase + "/**/_*.ejs"],
  watchEjs: [srcBase + "/**/*.ejs"],
};

const distPath = {
  css: distBase + "/asset/css/",
  js: distBase + "/asset/js/",
  img: distBase + "/asset/img/",
  html: distBase + "/",
  ejs: distBase + "/",
};

// ------------------------------------------------------------------------

/**
 * html
 */
const html = () => {
  return src(srcPath.html).pipe(dest(distPath.html));
};

/**
 * ejs
 */
const ejsHtml = () => {
  // readFileSync()は同期処理でファイルを読み込む
  const json = JSON.parse(fs.readFileSync("./ejs-config.json"));
  return (
    src(srcPath.ejs)
      // エラーが発生しても強制終了させない
      .pipe(
        $.plumber({
          errorHandler: $.notify.onError("Error: <%= error.message %>"),
        })
      )
      // ejsをまとめる
      .pipe($.ejs(json, { ext: ".html" }))
      .pipe($.rename({ extname: ".html" }))
      .pipe(
        $.htmlmin({
          // 圧縮時のオプション
          removeComments: true, // コメントを削除
          collapseWhitespace: true, // 余白を詰める
          collapseInlineTagWhitespace: true, // inline要素のスペース削除（spanタグ同士の改行などを詰める
          preserveLineBreaks: true, // タグ間の余白を詰める
          /*
           *オプション参照：https://github.com/kangax/html-minifier
           */
        })
      )
      .pipe($.prettier())
      .pipe(dest(distPath.ejs))
      // 変更があった所のみコンパイル
      .pipe(browserSync.stream())
  );
};

/**
 * img
 */
const imgMin = () => {
  return src(srcPath.img)
    .pipe(
      //エラーが出ても処理を止めない
      $.plumber({
        errorHandler: $.notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(
      $.imagemin([
        $.imagemin.svgo(),
        $.imagemin.optipng(),
        $.imagemin.gifsicle({ optimizationLevel: 3 }),
      ])
    )
    .pipe(dest(distPath.img))
    .pipe(browserSync.stream());
};

/**
 * sass
 */
const cssSass = () => {
  return src(srcPath.scss, {
    sourcemaps: true,
  })
    .pipe($.sassGlobUseForward())
    .pipe(
      //エラーが出ても処理を止めない
      $.plumber({
        errorHandler: $.notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe($.dartSass({ outputStyle: "expanded" })) //指定できるキー expanded compressed
    .pipe($.postcss([autoprefixer()]))
    .pipe(
      $.purgecss({
        content: ["./src/**/*.html", "./src/**/*.ejs", "./src/**/*.js"], // src()のファイルで使用される可能性のあるファイルを全て指定
      })
    )
    .pipe($.cleanCss())
    .pipe(dest(distPath.css, { sourcemaps: "./" })) //コンパイル先
    .pipe(browserSync.stream())
    .pipe(
      $.notify({
        message: "Sassをコンパイルしました！",
        onLast: true,
      })
    );
};

/**
 * distをリセット
 */
const clean = () => {
  return del([distBase + "/**"], {
    force: true,
  });
};

/**
 * ローカルサーバー立ち上げ
 */
const browserSyncFunc = () => {
  browserSync.init(browserSyncOption);
};

const browserSyncOption = {
  server: distBase,
};

/**
 * リロード
 */
const browserSyncReload = (done) => {
  browserSync.reload();
  done();
};

/**
 *
 * ファイル監視 ファイルの変更を検知したら、browserSyncReloadでreloadメソッドを呼び出す
 * series 順番に実行
 * watch('監視するファイル',処理)
 */

function startAppServer() {
  watch(srcPath.html, series(html, browserSyncReload));
  watch(srcPath.watchEjs, series(ejsHtml, browserSyncReload));
  watch(srcPath.img, series(imgMin, browserSyncReload));
  watch(srcPath.scss, series(cssSass, browserSyncReload));
}

// ------------------------------------------------------------------------

// 「gulp build」で、ビルドだけ
// 「gulp」で、ビルド＋変更監視・ライブサーバー立ち上げ

const build = series(clean, parallel(html, ejsHtml, cssSass, imgMin));

exports.html = html;
exports.ejsHtml = ejsHtml;
exports.imgMin = imgMin;
exports.cssSass = cssSass;
exports.build = build;

exports.default = series(build, parallel(startAppServer, browserSyncFunc));
