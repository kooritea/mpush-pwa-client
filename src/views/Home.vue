<template>
  <div class="home">
    <div class="nav">
      <zi-input class="search" clearable placeholder="search" v-model="search">
        <searchIcon slot="prefixIcon" />
      </zi-input>
      <router-link to="settings">
        <settings class="setting" />
      </router-link>
    </div>
    <div class="list">
      <div class="list-item" v-for="item in showList" :key="item.mid" @click="expend = item.mid">
        <div class="title" :class="{'title-expend':expend === item.mid}">
          <span class="text">{{item.message.text || date(Number(item.mid))}}</span>
          <span class="time">{{Number(item.mid) | date}}</span>
        </div>
        <div class="desp">
          <div class="markdown-body" v-if="expend !== item.mid">{{item.message.desp}}</div>
          <div class="markdown-body expend" v-else v-html="markdown(item.message.desp)"></div>
          <zi-row class="footer" v-if="expend === item.mid">
            <div class="handle">
              <copy @click="copyHandle(item.message)" />
              <a target="_blank" :href="item.message.extra.scheme" v-if="item.message.extra.scheme">
                <linkIcon />
              </a>
              <zi-tooltip>
                <alertCircle Click Trigger />
                <div slot="content" style="text-align:left">
                  <p>from: {{item.from.method}} {{item.from.name}}</p>
                  <p>target: {{item.sendType === 'personal'?"":"Group "}}{{item.target}}</p>
                </div>
              </zi-tooltip>
              <trash @click="trash(item)" />
            </div>
          </zi-row>
        </div>
      </div>
    </div>
    <!-- <zi-collapse class="list" v-model="expend" :accordion="true">
      <zi-collapse-item
        v-for="item in showList"
        :name="item.mid"
        :key="item.mid"
        :title="item.message.text || date(Number(item.mid))"
      >
        
      </zi-collapse-item>
    </zi-collapse>-->
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
      search: ""
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
  }
};
</script>
<style lang="scss" scoped>
.nav {
  margin: 10px 20px;
  position: relative;
  .search {
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
      white-space: nowrap;
      margin-bottom: 10px;
    }
    .expend {
      overflow: unset;
      text-overflow: unset;
      white-space: unset;
      word-break: break-all;
    }
    .footer {
      align-items: center;
      .handle > * {
        margin: 0 5px;
      }
      .handle .zi-tooltip {
        float: left;
      }
    }
  }
}
</style>
