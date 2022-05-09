import jQuery from "jquery";

// ドルマークに参照を代入(慣習的な $ を使うため)
const $ = jQuery;

const el = $(".c-section__title");
console.log(el);
console.log("aaa");
console.log("bbb");
el.fadeIn();

const init = () => {
  alert(hello("Bob", "Tom"));
};

const hello = (...args) => {
  return args.reduce((accu, curr) => {
    return `Hello! ${accu} ${curr}`;
  });
};

$(".l-header__logo").on("click", function () {
  init();
});

import { helloWorld } from "./module";

helloWorld();
// 出力：Hello World!!

//全てのモジュールをまとめてインポート
import Swiper from "swiper/bundle";

// 全てのスタイルをまとめて
import "swiper/css/bundle";

const swiper = new Swiper(".swiper", {
  // 以下にオプションを設定
  loop: true, //最後に達したら先頭に戻る

  //ページネーション表示の設定
  pagination: {
    el: ".swiper-pagination", //ページネーションの要素
    type: "bullets", //ページネーションの種類
    clickable: true, //クリックに反応させる
  },

  //ナビゲーションボタン（矢印）表示の設定
  navigation: {
    nextEl: ".swiper-button-next", //「次へボタン」要素の指定
    prevEl: ".swiper-button-prev", //「前へボタン」要素の指定
  },
});
