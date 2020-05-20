<template>
  <div class="home">
    <div class="nav">
      <zi-input
        class="search"
        clearable
        placeholder="search"
        v-model="search"
        @focus="focusSearch = true"
        @blur="focusSearch = false"
        :class="{'search-blur':!focusSearch}"
      >
        <searchIcon slot="prefixIcon" />
      </zi-input>
      <zi-checkbox class="fold" v-model="fold">收起同类消息</zi-checkbox>

      <router-link to="settings">
        <settings class="setting" />
      </router-link>
    </div>
    <ul class="list" v-if="search || !fold || focusSearch">
      <li
        class="list-item"
        v-for="item in showList"
        :key="item.mid"
        @click="expend = item.mid"
        :class="{isNew:item.isNew}"
      >
        <div class="title" :class="{'title-expend':expend === item.mid}">
          <span class="text">{{item.message.text || date(Number(item.mid))}}</span>
        </div>
        <div class="desp">
          <div class="markdown-body" v-if="expend !== item.mid">{{item.message.desp}}</div>
          <div class="markdown-body expend" v-else v-html="markdown(item.message.desp)"></div>
          <zi-row class="footer" v-if="expend === item.mid">
            <div class="handle">
              <copy @click="copyHandle(item.message)" />
              <a :href="item.message.extra.scheme" v-if="item.message.extra.scheme">
                <linkIcon />
              </a>
              <zi-tooltip>
                <alertCircle Click Trigger />
                <div slot="content" style="text-align:left">
                  <p>from: {{item.from.method}} {{item.from.name}}</p>
                  <p>target: {{item.sendType === 'personal'?"":"Group "}}{{item.target}}</p>
                  <p>time: {{Number(item.mid) | date}}</p>
                </div>
              </zi-tooltip>
              <trash @click="trash(item)" />
            </div>
          </zi-row>
        </div>
      </li>
    </ul>
    <ul class="list-fold" v-else>
      <li
        class="list-fold-group"
        v-for="(group,index) in showListFold"
        :key="group.key"
        :class="{hasNew:group.hasNew}"
      >
        <div
          class="title"
          @click="foldExpend === group.key ? foldExpend = null : foldExpend = group.key"
        >
          <span class="text">{{group.key}}</span>
        </div>
        <ul class="list-fold-item-ul" v-if="foldExpend === group.key">
          <li
            v-for="(item,index) in group.data"
            class="list-fold-item-li"
            :key="item.mid"
            @click="expend = item.mid"
            :class="{isNew:item.isNew}"
          >
            <div class="desp">
              <div
                class="markdown-body list-fold-item-desp"
                v-if="expend !== item.mid"
              >{{item.message.desp || '无正文'}}</div>
              <div
                class="markdown-body list-fold-item-desp expend"
                v-else
                v-html="markdown(item.message.desp) || '无正文'"
              ></div>
              <div style="clear:both"></div>
            </div>
            <zi-row class="footer" v-if="expend === item.mid">
              <div class="handle">
                <copy @click="copyHandle(item.message)" />
                <a :href="item.message.extra.scheme" v-if="item.message.extra.scheme">
                  <linkIcon />
                </a>
                <zi-tooltip>
                  <alertCircle Click Trigger />
                  <div slot="content" style="text-align:left">
                    <p>from: {{item.from.method}} {{item.from.name}}</p>
                    <p>target: {{item.sendType === 'personal'?"":"Group "}}{{item.target}}</p>
                    <p>time: {{Number(item.mid) | date}}</p>
                  </div>
                </zi-tooltip>
                <trash @click="trash(item)" />
              </div>
            </zi-row>
          </li>
        </ul>
      </li>
    </ul>
    <zi-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :beforeDone="dialogDone"
      done="确认"
      cancel="取消"
    ></zi-dialog>
  </div>
</template>

<script>
import filter from "@zeit-ui/vue-icons/packages/filter";
import settings from "@zeit-ui/vue-icons/packages/settings";
import copy from "@zeit-ui/vue-icons/packages/copy";
import link from "@zeit-ui/vue-icons/packages/link";
import alertCircle from "@zeit-ui/vue-icons/packages/alert-circle";
import trash from "@zeit-ui/vue-icons/packages/trash";
export default {
  name: "Home",
  components: {
    searchIcon: filter,
    settings,
    copy,
    linkIcon: link,
    alertCircle,
    trash
  },
  data() {
    return {
      expend: "",
      dialogVisible: false,
      dialogTitle: "",
      dialogDone: () => {},
      search: "",
      focusSearch: false,
      fold: false,
      foldExpend: ""
    };
  },
  computed: {
    messageList() {
      return this.$store.state.messages;
    },
    showList() {
      if (this.search) {
        return this.messageList.filter(item => {
          return (
            item.message.text.indexOf(this.search) > -1 ||
            item.message.desp.indexOf(this.search) > -1
          );
        });
      } else {
        return this.messageList;
      }
    },
    showListFold() {
      const index = {};
      for (const message of this.messageList) {
        const key = message.message.text ? message.message.text : "无标题";
        if (!index[message.message.text]) {
          index[message.message.text] = {
            data: [],
            hasNew: false
          };
        }
        index[message.message.text].data.push(message);
        index[message.message.text].hasNew = message.isNew
          ? true
          : index[message.message.text].hasNew;
      }
      const list = [];
      for (let key in index) {
        list.push({
          key,
          ...index[key]
        });
      }
      return list.sort((a, b) => {
        return b.data[0].mid - a.data[0].mid;
      });
    }
  },
  methods: {
    markdown(value) {
      return this.$options.filters.markdown(value);
    },
    date(value) {
      return this.$options.filters.date(value);
    },
    copyHandle(message) {
      if (message.desp) {
        let textArea = document.createElement("textarea");
        textArea.value = message.desp;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        this.$Toast.show({
          type: "success",
          text: `复制成功`
        });
        document.body.removeChild(textArea);
      } else {
        this.$Toast.show({
          type: "error",
          text: `复制失败,内容为空`
        });
      }
    },
    trash(message) {
      this.comfirm("确认要删除?", () => {
        this.$store.commit({
          type: "deleteMessage",
          message
        });
        this.$messagesdb.del(message.mid);
      });
    },
    comfirm(text, done) {
      this.dialogTitle = text;
      this.dialogVisible = true;
      this.dialogDone = () => {
        this.dialogVisible = false;
        done();
      };
    }
  },
  watch: {
    fold(newVal) {
      localStorage.setItem("fold", newVal);
    }
  },
  created() {
    this.fold = localStorage.getItem("fold") === "true";
  }
};
</script>
<style lang="scss" scoped>
.nav {
  margin: 10px 20px;
  position: relative;
  .search {
  }
  .search-blur {
    overflow: hidden;
    width: 110px;
    border-right: 1px solid var(--accents-2);
  }
  .fold {
    margin-left: 10px;
  }
  .setting {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }
}

.list {
  padding: 0 20px;
  * {
    color: #aaa;
  }
  .isNew {
    .title {
      .text {
        color: #000;
      }
    }
    .desp {
      * {
        color: #000;
      }
    }
  }
  .list-item {
    border-bottom: 1px solid #000;
    cursor: pointer;
  }
  .title {
    height: 25px;
    line-height: 25px;
    display: flex;
    .text {
      font-size: 22px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    .time {
      float: right;
      font-size: 15px;
      color: #555;
    }
  }
  .title-expend {
    height: unset;
    position: relative;
    .text {
      overflow: unset;
      text-overflow: unset;
      white-space: unset;
      word-break: break-all;
    }
  }
  .desp {
    .markdown-body {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      margin-bottom: 10px;
    }
    .expend {
      overflow: unset;
      text-overflow: unset;
      white-space: unset;
      word-break: break-all;
      -webkit-line-clamp: unset;
      -webkit-box-orient: unset;
    }
    .footer {
      align-items: center;
      .handle > * {
        margin: 0 5px;
      }
      .handle .zi-tooltip {
        float: left;
      }
      svg {
        width: 15px;
      }
    }
  }
}
.list-fold {
  padding: 0 20px;
  * {
    color: #aaa;
  }
  .hasNew {
    .title {
      .text {
        color: #000;
      }
    }
    .isNew {
      .desp {
        * {
          color: #000;
        }
      }
    }
  }
  .list-fold-group {
    border-bottom: 1px solid #000;
    .title {
      cursor: pointer;
    }
    .list-fold-item-desp {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      flex: 1;
    }
    .expend {
      overflow: unset;
      text-overflow: unset;
      white-space: unset;
      word-break: break-all;
      display: block;
      -webkit-line-clamp: unset;
      -webkit-box-orient: unset;
    }
    .list-fold-item-li {
      cursor: pointer;
      .desp {
        display: flex;
        .list-fold-item-desp {
          flex: 1;
        }
        .list-fold-item-time {
          float: right;
          font-size: 15px;
          color: #555;
        }
      }
      .footer {
        align-items: center;
        .handle {
          height: 24px;
        }
        .handle > * {
          margin: 0 5px;
        }
        svg {
          width: 15px;
        }
        .handle .zi-tooltip {
          float: left;
        }
      }
    }
  }
}
</style>
