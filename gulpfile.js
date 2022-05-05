// gulp本体の機能を分割代入
const { src, dest } = require("gulp");
const loadPlugins = require("gulp-load-plugins");
const $ = loadPlugins();

// Node.jsでファイルを操作するための公式モジュール
const fs = require("fs");

//ブラウザリロード
const browserSync = require("browser-sync");

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

// ------------------------------------------------------------------------

exports.ejsHtml = ejsHtml;
exports.imgMin = imgMin;
