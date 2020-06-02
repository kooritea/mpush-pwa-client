import Vue from "vue";
import marked from "marked";
import "github-markdown-css";

const renderer = new marked.Renderer();

renderer.link = function(href, title, text) {
  return `<a title="${title}" target="_blank" href="${href}">${text}</a>`;
};

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: true,
  sanitize: true, // 清理标签
  smartLists: true,
  smartypants: true
});

Vue.filter("markdown", function(value) {
  return marked(value);
});

Vue.filter("date", function(value) {
  return format(value, "MM-dd HH:mm:ss");
});

function format(time, format) {
  let t = new Date(time);
  let tf = function(i) {
    return (i < 10 ? "0" : "") + i;
  };
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a) {
    switch (a) {
      case "yyyy":
        return tf(t.getFullYear());
      case "MM":
        return tf(t.getMonth() + 1);
      case "mm":
        return tf(t.getMinutes());
      case "dd":
        return tf(t.getDate());
      case "HH":
        return tf(t.getHours());
      case "ss":
        return tf(t.getSeconds());
    }
  });
}
