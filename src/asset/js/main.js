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
