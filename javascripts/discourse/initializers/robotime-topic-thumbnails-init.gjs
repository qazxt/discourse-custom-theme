import { apiInitializer } from "discourse/lib/api";
import RobotimeTopicListThumbnail from "../components/robotime-topic-list-thumbnail";
import RobotimeTopicMeta from "../components/robotime-topic-meta";

/* global settings */
export default apiInitializer((api) => {
  // `settings` is injected by Discourse for theme JS.
  // eslint-disable-next-line no-undef
  const ts = typeof settings !== "undefined" && settings ? settings : {};
  const enabled =
    ts.robotime_topic_thumbnails_enabled !== false &&
    ts.robotime_topic_thumbnails_enabled !== "false";
  const metaEnabled =
    ts.robotime_topic_meta_enabled !== false &&
    ts.robotime_topic_meta_enabled !== "false";

  if (!enabled) {
    return;
  }

  api.registerValueTransformer("topic-list-columns", ({ value: columns }) => {
    if (!columns.has("topic-thumbnails")) {
      columns.add("topic-thumbnails", { item: RobotimeTopicListThumbnail }, { before: "topic" });
    }
    return columns;
  });

  if (metaEnabled) {
    api.renderInOutlet(
      "topic-list-before-link",
      <template>
        <RobotimeTopicMeta @topic={{@outletArgs.topic}} />
      </template>
    );
  }
});
