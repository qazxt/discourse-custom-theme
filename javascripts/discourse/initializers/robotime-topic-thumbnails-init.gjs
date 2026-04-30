import { apiInitializer } from "discourse/lib/api";
import HeaderTopicCell from "discourse/components/topic-list/header/topic-cell";
import RobotimeTopicListThumbnail from "../components/robotime-topic-list-thumbnail";
import RobotimeTopicListTopicCell from "../components/robotime-topic-list-topic-cell";

/* global settings */
export default apiInitializer((api) => {
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

    /* Card body = preview `.topic-content`: title + single footer row (meta + last poster). */
    if (metaEnabled && columns.has("topic")) {
      columns.delete("topic");
      if (columns.has("posters")) {
        columns.delete("posters");
      }
      columns.add(
        "topic",
        {
          header: HeaderTopicCell,
          item: RobotimeTopicListTopicCell,
        },
        { before: "replies" }
      );
    }

    return columns;
  });
});
