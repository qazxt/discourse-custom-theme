import Component from "@glimmer/component";

export default class RobotimeTopicMeta extends Component {
  get topic() {
    return this.args.topic;
  }

  get views() {
    return Number(this.topic?.views || 0);
  }

  get likes() {
    return Number(this.topic?.like_count || 0);
  }

  get replies() {
    return Number(this.topic?.posts_count || 0);
  }

  get hasAnyStat() {
    return this.views > 0 || this.likes > 0 || this.replies >= 0;
  }

  <template>
    {{#if this.hasAnyStat}}
      <div class="robotime-topic-meta">
        <span class="robotime-topic-meta__item">
          <span
            class="robotime-topic-meta__icon robotime-topic-meta__icon--views"
            aria-hidden="true"
          ></span>
          <span class="number">{{this.views}}</span>
        </span>
        <span class="robotime-topic-meta__item">
          <span
            class="robotime-topic-meta__icon robotime-topic-meta__icon--likes"
            aria-hidden="true"
          ></span>
          <span class="number">{{this.likes}}</span>
        </span>
        <span class="robotime-topic-meta__item">
          <span
            class="robotime-topic-meta__icon robotime-topic-meta__icon--comments"
            aria-hidden="true"
          ></span>
          <span class="number">{{this.replies}}</span>
        </span>
      </div>
    {{/if}}
  </template>
}
