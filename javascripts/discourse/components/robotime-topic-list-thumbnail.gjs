import Component from "@glimmer/component";

export default class RobotimeTopicListThumbnail extends Component {
  responsiveRatios = [1, 1.5, 2];

  get topic() {
    return this.args.topic;
  }

  get hasThumbnail() {
    return !!this.thumbnailSrc;
  }

  get displayWidth() {
    return 400;
  }

  get original() {
    return this.topic?.thumbnails?.[0];
  }

  get srcSet() {
    const srcSetArray = [];
    const thumbs = this.topic?.thumbnails || [];

    this.responsiveRatios.forEach((ratio) => {
      const target = ratio * this.displayWidth;
      const match = thumbs.find((t) => t.url && t.max_width === target);
      if (match) {
        srcSetArray.push(`${match.url} ${ratio}x`);
      }
    });

    if (srcSetArray.length === 0 && this.original?.url) {
      srcSetArray.push(`${this.original.url} 1x`);
    }

    return srcSetArray.join(",");
  }

  get fallbackSrc() {
    const thumbs = this.topic?.thumbnails || [];
    const largeEnough = thumbs.filter((t) => {
      if (!t?.url) {
        return false;
      }
      return t.max_width > this.displayWidth * 2;
    });
    return (
      largeEnough.at(-1)?.url ||
      this.original?.url ||
      this.topic?.image_url ||
      this.topic?.imageUrl ||
      this.excerptImageSrc ||
      ""
    );
  }

  get excerptImageSrc() {
    const excerpt = String(this.topic?.excerpt || "").trim();
    if (!excerpt) {
      return "";
    }
    try {
      const doc = new window.DOMParser().parseFromString(
        `<div>${excerpt}</div>`,
        "text/html"
      );
      const img = doc.querySelector("img");
      const src = (img?.getAttribute("src") || "").trim();
      return src;
    } catch (e) {
      return "";
    }
  }

  get thumbnailSrc() {
    return this.fallbackSrc;
  }

  get imageWidth() {
    return this.original?.width || null;
  }

  get imageHeight() {
    return this.original?.height || null;
  }

  get url() {
    return this.topic?.get("linked_post_number")
      ? this.topic.urlForPostNumber(this.topic.get("linked_post_number"))
      : this.topic?.get("lastUnreadUrl");
  }

  <template>
    <a
      href={{this.url}}
      class="robotime-topic-list-thumbnail-link"
      role="img"
      aria-label={{this.topic.title}}
    >
      {{#if this.hasThumbnail}}
        <img
          class="robotime-topic-list-thumbnail-img"
          src={{this.thumbnailSrc}}
          srcset={{this.srcSet}}
          width={{this.imageWidth}}
          height={{this.imageHeight}}
          loading="lazy"
          alt=""
        />
      {{/if}}
    </a>
  </template>
}
